import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  corsHeaders,
  jsonResponse,
  requireAuth,
  checkRateLimit,
  rateLimitResponse,
} from '../_shared/auth.ts';

const CREDIT_PACKAGES: Record<string, { credits: number; price_inr: number; label: string }> = {
  starter: { credits: 2500,  price_inr: 16600,  label: 'Starter Pack' },  // ~$2 in paise
  popular: { credits: 6500,  price_inr: 41500,  label: 'Popular Pack' },  // ~$5
  pro:     { credits: 14000, price_inr: 83000,  label: 'Pro Pack' },      // ~$10
  studio:  { credits: 37500, price_inr: 207500, label: 'Studio Pack' },   // ~$25
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    if (!checkRateLimit(authResult.userId, 'razorpay-checkout', 10, 60)) {
      return rateLimitResponse();
    }

    const { package_id } = await req.json();
    const pkg = CREDIT_PACKAGES[package_id];
    if (!pkg) return jsonResponse({ error: 'Invalid package_id' }, 400);

    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keyId || !keySecret) return jsonResponse({ error: 'Razorpay not configured' }, 500);

    const credentials = btoa(`${keyId}:${keySecret}`);

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: pkg.price_inr,
        currency: 'INR',
        receipt: `artigen_${authResult.userId.slice(0, 8)}_${Date.now()}`,
        notes: {
          user_id: authResult.userId,
          package_id,
          credits: String(pkg.credits),
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.description || `Razorpay error: ${res.status}`);
    }

    const order = await res.json();
    return jsonResponse({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
      credits: pkg.credits,
      label: pkg.label,
    });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Internal server error' });
  }
});

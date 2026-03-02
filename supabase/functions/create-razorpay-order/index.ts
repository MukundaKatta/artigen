import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CREDIT_PACKAGES: Record<string, { credits: number; price_inr: number; label: string }> = {
  starter: { credits: 2500,  price_inr: 16600,  label: 'Starter Pack' },  // ~$2 in paise
  popular: { credits: 6500,  price_inr: 41500,  label: 'Popular Pack' },  // ~$5
  pro:     { credits: 14000, price_inr: 83000,  label: 'Pro Pack' },      // ~$10
  studio:  { credits: 37500, price_inr: 207500, label: 'Studio Pack' },   // ~$25
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse({ error: 'Missing authorization' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return jsonResponse({ error: 'Unauthorized' }, 401);

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
        receipt: `artigen_${user.id.slice(0, 8)}_${Date.now()}`,
        notes: {
          user_id: user.id,
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

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CREDIT_PACKAGES: Record<string, { credits: number; price_cents: number; label: string }> = {
  starter: { credits: 2500,  price_cents: 200,  label: 'Starter Pack — 2,500 credits' },
  popular: { credits: 6500,  price_cents: 500,  label: 'Popular Pack — 6,500 credits' },
  pro:     { credits: 14000, price_cents: 1000, label: 'Pro Pack — 14,000 credits' },
  studio:  { credits: 37500, price_cents: 2500, label: 'Studio Pack — 37,500 credits' },
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

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) return jsonResponse({ error: 'Stripe not configured' }, 500);

    const appUrl = Deno.env.get('APP_URL') || 'https://artigen-app.web.app';

    // Create Stripe Checkout Session via REST API
    const formData = new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][unit_amount]': String(pkg.price_cents),
      'line_items[0][price_data][product_data][name]': pkg.label,
      'line_items[0][price_data][product_data][description]': `${pkg.credits.toLocaleString()} AI generation credits`,
      'line_items[0][quantity]': '1',
      'mode': 'payment',
      'success_url': `${appUrl}/buy-credits?status=success&package=${package_id}`,
      'cancel_url': `${appUrl}/buy-credits?status=cancelled`,
      'metadata[user_id]': user.id,
      'metadata[package_id]': package_id,
      'metadata[credits]': String(pkg.credits),
    });

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `Stripe error: ${res.status}`);
    }

    const session = await res.json();
    return jsonResponse({ checkout_url: session.url, session_id: session.id });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Internal server error' });
  }
});

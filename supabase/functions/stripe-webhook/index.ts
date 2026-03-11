import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'stripe-signature, content-type',
};

// Verify Stripe webhook signature using Web Crypto
async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  try {
    const parts = sigHeader.split(',').reduce((acc: Record<string, string>, part) => {
      const [k, v] = part.split('=');
      acc[k] = v;
      return acc;
    }, {});

    const timestamp = parts['t'];
    const signature = parts['v1'];
    if (!timestamp || !signature) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
    const expectedSig = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, '0')).join('');

    return expectedSig === signature;
  } catch {
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) return new Response('Webhook secret not configured', { status: 500 });

    const payload = await req.text();
    const sigHeader = req.headers.get('stripe-signature') || '';

    const isValid = await verifyStripeSignature(payload, sigHeader, webhookSecret);
    if (!isValid) return new Response('Invalid signature', { status: 400 });

    const event = JSON.parse(payload);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const credits = parseInt(session.metadata?.credits || '0', 10);
      const packageId = session.metadata?.package_id;

      if (!userId || credits <= 0) return new Response('Missing metadata', { status: 400 });

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      // Atomic idempotency: INSERT will fail on duplicate (unique PK), preventing race conditions
      const eventId = event.id;
      if (eventId) {
        const { error: insertError } = await supabase.from('webhook_events').insert({
          id: eventId,
          event_type: event.type,
          provider: 'stripe',
          payload: { user_id: userId, credits, package_id: packageId },
        });

        if (insertError?.code === '23505') {
          // Unique violation = already processed
          return new Response(JSON.stringify({ received: true, duplicate: true }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }
        if (insertError) throw insertError;
      }

      await supabase.rpc('add_credits', {
        p_user_id: userId,
        p_amount: credits,
        p_description: `Stripe purchase — ${packageId} pack (${credits.toLocaleString()} credits)`,
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response('Internal error', { status: 500 });
  }
});

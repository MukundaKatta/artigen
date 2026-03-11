import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Verify Razorpay webhook signature (HMAC SHA-256)
async function verifyRazorpaySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const expected = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, '0')).join('');
    return expected === signature;
  } catch {
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok');

  try {
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
    if (!webhookSecret) return new Response('Webhook secret not configured', { status: 500 });

    const payload = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    const isValid = await verifyRazorpaySignature(payload, signature, webhookSecret);
    if (!isValid) return new Response('Invalid signature', { status: 400 });

    const event = JSON.parse(payload);

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const notes = payment.notes || {};
      const userId = notes.user_id;
      const credits = parseInt(notes.credits || '0', 10);
      const packageId = notes.package_id;

      if (!userId || credits <= 0) return new Response('Missing notes', { status: 400 });

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      // Idempotency check: prevent duplicate processing of same payment
      const paymentId = payment.id;
      if (paymentId) {
        const { data: existing } = await supabase
          .from('webhook_events')
          .select('id')
          .eq('id', paymentId)
          .maybeSingle();

        if (existing) {
          return new Response(JSON.stringify({ status: 'ok', duplicate: true }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        await supabase.from('webhook_events').insert({
          id: paymentId,
          event_type: event.event,
          provider: 'razorpay',
          payload: { user_id: userId, credits, package_id: packageId },
        });
      }

      await supabase.rpc('add_credits', {
        p_user_id: userId,
        p_amount: credits,
        p_description: `Razorpay purchase — ${packageId} pack (${credits.toLocaleString()} credits)`,
      });
    }

    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response('Internal error', { status: 500 });
  }
});

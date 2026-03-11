import { corsHeaders, jsonResponse, createServiceClient, requireAuth, checkRateLimit, rateLimitResponse, sanitizeText } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Verify authentication
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    const sender_id = authResult.userId;

    // Rate limit: 10 tips per minute
    if (!checkRateLimit(sender_id, 'tip', 10, 60)) {
      return rateLimitResponse();
    }

    const supabase = createServiceClient();
    const body = await req.json();
    const { recipient_id, post_id, amount_cents, message } = body;

    if (!recipient_id || typeof recipient_id !== 'string') {
      return jsonResponse({ error: 'recipient_id is required' }, 400);
    }
    if (!amount_cents || typeof amount_cents !== 'number' || amount_cents <= 0) {
      return jsonResponse({ error: 'positive amount_cents required' }, 400);
    }
    if (sender_id === recipient_id) {
      return jsonResponse({ error: 'Cannot tip yourself' }, 400);
    }
    if (!Number.isInteger(amount_cents) || amount_cents > 100000) {
      return jsonResponse({ error: 'Invalid amount (must be integer, max 100000)' }, 400);
    }

    const fee_cents = Math.floor(amount_cents * 0.05); // 5% platform fee
    const sanitizedMessage = message ? sanitizeText(String(message), 500) : null;

    // Use atomic RPC to process entire tip in a single transaction
    // This prevents race conditions by locking wallet rows
    const { data: tipId, error: rpcError } = await supabase.rpc('process_tip_atomic', {
      p_sender_id: sender_id,
      p_recipient_id: recipient_id,
      p_amount: amount_cents,
      p_fee: fee_cents,
      p_post_id: post_id || null,
      p_message: sanitizedMessage,
    });

    if (rpcError) {
      const msg = rpcError.message || '';
      if (msg.includes('insufficient_credits')) {
        return jsonResponse({ error: 'Insufficient balance' }, 400);
      }
      if (msg.includes('wallet_not_found') || msg.includes('sender_wallet_not_found')) {
        return jsonResponse({ error: 'Wallet not found. Please add credits first.' }, 400);
      }
      throw rpcError;
    }

    // Create notification (fire-and-forget, non-critical)
    supabase.from('notifications').insert({
      notification_type: 'tip',
      sender_id,
      recipient_id,
      post_id: post_id || null,
    }).then(() => {}).catch(() => {});

    return jsonResponse({ success: true, tip_id: tipId });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});

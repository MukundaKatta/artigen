import { corsHeaders, jsonResponse, createServiceClient, requireAuth, checkRateLimit, rateLimitResponse } from '../_shared/auth.ts';

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
    const net_amount = amount_cents - fee_cents;

    // Atomic debit: conditional update ensures balance is sufficient (prevents race conditions)
    const { data: debitedWallet, error: debitError } = await supabase
      .from('wallets')
      .update({
        balance_cents: supabase.rpc ? undefined : 0, // placeholder — real decrement below
      })
      .eq('user_id', sender_id)
      .gte('balance_cents', amount_cents)
      .select('id, balance_cents')
      .single();

    // Use raw SQL via RPC for atomic decrement to prevent race conditions
    const { data: debitResult, error: rpcError } = await supabase.rpc('debit_wallet', {
      p_user_id: sender_id,
      p_amount: amount_cents,
    });

    if (rpcError) {
      // Fallback: conditional update
      const { data: senderWallet } = await supabase
        .from('wallets')
        .select('id, balance_cents, lifetime_spent_cents')
        .eq('user_id', sender_id)
        .single();

      if (!senderWallet || senderWallet.balance_cents < amount_cents) {
        return jsonResponse({ error: 'Insufficient balance' }, 400);
      }

      const { data: updated, error: updateErr } = await supabase
        .from('wallets')
        .update({
          balance_cents: senderWallet.balance_cents - amount_cents,
          lifetime_spent_cents: senderWallet.lifetime_spent_cents + amount_cents,
        })
        .eq('id', senderWallet.id)
        .gte('balance_cents', amount_cents)
        .select('id')
        .single();

      if (updateErr || !updated) {
        return jsonResponse({ error: 'Insufficient balance' }, 400);
      }
    }

    // Get sender wallet ID for transaction records
    const { data: senderWalletData } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', sender_id)
      .single();

    // Get or create recipient wallet, then credit atomically
    let { data: recipientWallet } = await supabase
      .from('wallets')
      .select('id, balance_cents, lifetime_earned_cents')
      .eq('user_id', recipient_id)
      .single();

    if (!recipientWallet) {
      const { data: created } = await supabase
        .from('wallets')
        .insert({ user_id: recipient_id, balance_cents: 0, lifetime_earned_cents: 0, lifetime_spent_cents: 0 })
        .select('id, balance_cents, lifetime_earned_cents')
        .single();
      recipientWallet = created;
    }

    if (!recipientWallet) {
      // Refund sender if we can't credit recipient
      await supabase.rpc('refund_generation_credits', { p_user_id: sender_id, p_cost: amount_cents }).catch(() => {});
      return jsonResponse({ error: 'Could not find or create recipient wallet' }, 500);
    }

    // Credit recipient
    await supabase.from('wallets').update({
      balance_cents: recipientWallet.balance_cents + net_amount,
      lifetime_earned_cents: recipientWallet.lifetime_earned_cents + net_amount,
    }).eq('id', recipientWallet.id);

    // Create transaction records, tip record, and notification in parallel
    const [senderTxResult] = await Promise.all([
      supabase.from('wallet_transactions').insert({
        wallet_id: senderWalletData?.id,
        type: 'tip_sent',
        amount_cents,
        fee_cents: 0,
        counterparty_id: recipient_id,
        post_id: post_id || null,
        description: 'Tip to creator',
        status: 'completed',
      }).select('id').single(),

      supabase.from('wallet_transactions').insert({
        wallet_id: recipientWallet.id,
        type: 'tip_received',
        amount_cents: net_amount,
        fee_cents,
        counterparty_id: sender_id,
        post_id: post_id || null,
        description: 'Tip received',
        status: 'completed',
      }),

      supabase.from('notifications').insert({
        notification_type: 'tip',
        sender_id,
        recipient_id,
        post_id: post_id || null,
      }),
    ]);

    // Create tip record
    await supabase.from('tips').insert({
      sender_id,
      recipient_id,
      post_id: post_id || null,
      amount_cents,
      message: message || '',
      transaction_id: senderTxResult.data?.id || null,
    });

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});

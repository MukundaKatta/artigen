import { corsHeaders, jsonResponse, createServiceClient, requireAuth } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Verify authentication
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    const supabase = createServiceClient();
    const { recipient_id, post_id, amount_cents, message } = await req.json();

    // The sender must be the authenticated user
    const sender_id = authResult.userId;

    if (!recipient_id || !amount_cents || amount_cents <= 0) {
      return jsonResponse({ error: 'recipient_id and positive amount_cents required' }, 400);
    }

    if (sender_id === recipient_id) {
      return jsonResponse({ error: 'Cannot tip yourself' }, 400);
    }

    if (!Number.isInteger(amount_cents) || amount_cents > 100000) {
      return jsonResponse({ error: 'Invalid amount' }, 400);
    }

    // Get sender wallet
    const { data: senderWallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', sender_id)
      .single();

    if (!senderWallet || senderWallet.balance_cents < amount_cents) {
      return jsonResponse({ error: 'Insufficient balance' }, 400);
    }

    // Get or create recipient wallet
    let { data: recipientWallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', recipient_id)
      .single();

    if (!recipientWallet) {
      const { data: created } = await supabase
        .from('wallets')
        .insert({ user_id: recipient_id })
        .select('*')
        .single();
      recipientWallet = created;
    }

    const fee_cents = Math.floor(amount_cents * 0.05); // 5% platform fee
    const net_amount = amount_cents - fee_cents;

    // Use RPC for atomic wallet transfer if available, otherwise do sequential updates
    // Debit sender — use conditional update to prevent race conditions
    const { error: debitError } = await supabase.rpc('debit_wallet', {
      p_user_id: sender_id,
      p_amount: amount_cents,
    }).single();

    if (debitError) {
      // Fallback: conditional update ensuring balance is sufficient
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

    // Credit recipient
    await supabase.from('wallets').update({
      balance_cents: recipientWallet!.balance_cents + net_amount,
      lifetime_earned_cents: recipientWallet!.lifetime_earned_cents + net_amount,
    }).eq('id', recipientWallet!.id);

    // Create transactions
    const { data: senderTx } = await supabase.from('wallet_transactions').insert({
      wallet_id: senderWallet.id,
      type: 'tip_sent',
      amount_cents,
      fee_cents: 0,
      counterparty_id: recipient_id,
      post_id: post_id || null,
      description: 'Tip to creator',
      status: 'completed',
    }).select('id').single();

    await supabase.from('wallet_transactions').insert({
      wallet_id: recipientWallet!.id,
      type: 'tip_received',
      amount_cents: net_amount,
      fee_cents,
      counterparty_id: sender_id,
      post_id: post_id || null,
      description: 'Tip received',
      status: 'completed',
    });

    // Create tip record
    await supabase.from('tips').insert({
      sender_id,
      recipient_id,
      post_id: post_id || null,
      amount_cents,
      message: message || '',
      transaction_id: senderTx?.id || null,
    });

    // Create notification
    await supabase.from('notifications').insert({
      notification_type: 'tip',
      sender_id,
      recipient_id,
      post_id: post_id || null,
    });

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});

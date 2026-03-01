import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { sender_id, recipient_id, post_id, amount_cents, message } = await req.json();

    if (!sender_id || !recipient_id || !amount_cents || amount_cents <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get sender wallet
    const { data: senderWallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', sender_id)
      .single();

    if (!senderWallet || senderWallet.balance_cents < amount_cents) {
      return new Response(JSON.stringify({ error: 'Insufficient balance' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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

    // Debit sender
    await supabase.from('wallets').update({
      balance_cents: senderWallet.balance_cents - amount_cents,
      lifetime_spent_cents: senderWallet.lifetime_spent_cents + amount_cents,
    }).eq('id', senderWallet.id);

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
      description: `Tip to creator`,
      status: 'completed',
    }).select('id').single();

    await supabase.from('wallet_transactions').insert({
      wallet_id: recipientWallet!.id,
      type: 'tip_received',
      amount_cents: net_amount,
      fee_cents,
      counterparty_id: sender_id,
      post_id: post_id || null,
      description: `Tip received`,
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

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

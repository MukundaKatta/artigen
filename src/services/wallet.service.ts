import { supabase } from '@/lib/supabase';

export async function getWallet(userId: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data && !error) {
    const { data: newWallet, error: createError } = await supabase
      .from('wallets')
      .insert({ user_id: userId })
      .select()
      .single();
    return { data: newWallet, error: createError };
  }
  return { data, error };
}

export async function getTransactions(walletId: string, page = 0, pageSize = 20) {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*, counterparty:profiles!counterparty_id(id, username, avatar_url)')
    .eq('wallet_id', walletId)
    .order('created_at', { ascending: false })
    .range(from, to);
  return { data, error };
}

export async function getWalletBalance(userId: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('balance_cents, lifetime_earned_cents, lifetime_spent_cents')
    .eq('user_id', userId)
    .single();
  return { data, error };
}

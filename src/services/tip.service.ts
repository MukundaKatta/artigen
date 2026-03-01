import { supabase } from '@/lib/supabase';

export async function sendTip(params: {
  senderId: string;
  recipientId: string;
  postId?: string;
  amountCents: number;
  message?: string;
}) {
  const { data, error } = await supabase.functions.invoke('process-tip', {
    body: {
      sender_id: params.senderId,
      recipient_id: params.recipientId,
      post_id: params.postId,
      amount_cents: params.amountCents,
      message: params.message || '',
    },
  });
  return { data, error };
}

export async function getTipsForPost(postId: string) {
  const { data, error } = await supabase
    .from('tips')
    .select('*, sender:profiles!sender_id(id, username, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getEarnings(userId: string) {
  const { data, error } = await supabase
    .from('tips')
    .select('amount_cents, created_at')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

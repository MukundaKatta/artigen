import { supabase } from '@/lib/supabase';

export type MessageReaction = {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
};

export async function addReaction(messageId: string, userId: string, emoji: string) {
  const { data, error } = await supabase
    .from('message_reactions')
    .insert({ message_id: messageId, user_id: userId, emoji })
    .select()
    .single();
  return { data: data as unknown as MessageReaction | null, error };
}

export async function removeReaction(messageId: string, userId: string, emoji: string) {
  const { error } = await supabase
    .from('message_reactions')
    .delete()
    .eq('message_id', messageId)
    .eq('user_id', userId)
    .eq('emoji', emoji);
  return { error };
}

export async function getReactionsForMessages(messageIds: string[]) {
  if (messageIds.length === 0) return new Map<string, MessageReaction[]>();
  const { data } = await supabase
    .from('message_reactions')
    .select('*')
    .in('message_id', messageIds);

  const map = new Map<string, MessageReaction[]>();
  ((data ?? []) as unknown as MessageReaction[]).forEach((r) => {
    const existing = map.get(r.message_id) ?? [];
    existing.push(r);
    map.set(r.message_id, existing);
  });
  return map;
}

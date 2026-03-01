import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

export async function getCloseFriends(userId: string) {
  const { data, error } = await supabase
    .from('close_friends')
    .select('friend_id, friend:profiles!friend_id(id, username, full_name, avatar_url)')
    .eq('user_id', userId);

  if (error || !data) return { data: [] as Profile[], error };

  const friends = data.map((d: any) => d.friend as Profile);
  return { data: friends, error: null };
}

export async function addCloseFriend(userId: string, friendId: string) {
  const { error } = await supabase
    .from('close_friends')
    .insert({ user_id: userId, friend_id: friendId });
  return { error };
}

export async function removeCloseFriend(userId: string, friendId: string) {
  const { error } = await supabase
    .from('close_friends')
    .delete()
    .eq('user_id', userId)
    .eq('friend_id', friendId);
  return { error };
}

export async function isCloseFriend(userId: string, friendId: string) {
  const { data } = await supabase
    .from('close_friends')
    .select('id')
    .eq('user_id', userId)
    .eq('friend_id', friendId)
    .maybeSingle();
  return !!data;
}

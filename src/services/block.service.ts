import { supabase } from '@/lib/supabase';

export async function blockUser(blockerId: string, blockedId: string) {
  const { error } = await supabase
    .from('user_blocks')
    .insert({ blocker_id: blockerId, blocked_id: blockedId });

  // Also unfollow in both directions
  if (!error) {
    await Promise.all([
      supabase.from('follows').delete().eq('follower_id', blockerId).eq('following_id', blockedId),
      supabase.from('follows').delete().eq('follower_id', blockedId).eq('following_id', blockerId),
    ]);
  }

  return { error };
}

export async function unblockUser(blockerId: string, blockedId: string) {
  const { error } = await supabase
    .from('user_blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);
  return { error };
}

export async function getBlockedUsers(userId: string) {
  const { data, error } = await supabase
    .from('user_blocks')
    .select('blocked_id, blocked:profiles!blocked_id(id, username, full_name, avatar_url)')
    .eq('blocker_id', userId);
  return { data: data || [], error };
}

export async function isBlocked(blockerId: string, blockedId: string) {
  const { data } = await supabase
    .from('user_blocks')
    .select('id')
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
    .maybeSingle();
  return !!data;
}

export async function getBlockedUserIds(userId: string) {
  const { data } = await supabase
    .from('user_blocks')
    .select('blocked_id')
    .eq('blocker_id', userId);
  return new Set(((data ?? []) as Array<{ blocked_id: string }>).map((d) => d.blocked_id));
}

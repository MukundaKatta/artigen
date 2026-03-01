import { supabase } from '@/lib/supabase';
import { createNotification } from '@/services/notification.service';

export async function followUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId });

  // Create notification (fire-and-forget)
  if (!error) {
    createNotification({ type: 'follow', senderId: followerId, recipientId: followingId });
  }

  return { error };
}

export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
  return { error };
}

export async function checkIsFollowing(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();
  return { isFollowing: !!data, error };
}

export async function getFollowers(userId: string, page = 0, pageSize = 20) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('follows')
    .select('follower_id, profiles:profiles!follower_id(id, username, full_name, avatar_url, is_verified)')
    .eq('following_id', userId)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data, error };
}

export async function getFollowing(userId: string, page = 0, pageSize = 20) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('follows')
    .select('following_id, profiles:profiles!following_id(id, username, full_name, avatar_url, is_verified)')
    .eq('follower_id', userId)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data, error };
}

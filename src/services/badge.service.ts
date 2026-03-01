import { supabase } from '@/lib/supabase';
import type { Badge, UserBadge } from '@/types';

export type UserBadgeWithDetails = UserBadge & {
  badge: Badge;
};

export async function getUserBadges(userId: string) {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badge:badges!badge_id(*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  return { data: (data || []) as unknown as UserBadgeWithDetails[], error };
}

export async function getAllBadges() {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('category', { ascending: true });

  return { data: (data || []) as unknown as Badge[], error };
}

export async function awardBadge(userId: string, badgeId: string) {
  const { data, error } = await supabase
    .from('user_badges')
    .upsert(
      { user_id: userId, badge_id: badgeId },
      { onConflict: 'user_id,badge_id', ignoreDuplicates: true }
    )
    .select('*, badge:badges!badge_id(*)')
    .single();

  return { data: data as unknown as UserBadgeWithDetails | null, error };
}

export async function checkAndAwardPostBadges(userId: string) {
  // Get post count
  const { count: postCount } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_archived', false);

  const awarded: string[] = [];

  if (postCount && postCount >= 1) {
    const { data } = await awardBadge(userId, 'first_post');
    if (data) awarded.push('first_post');
  }
  if (postCount && postCount >= 10) {
    const { data } = await awardBadge(userId, 'ten_posts');
    if (data) awarded.push('ten_posts');
  }
  if (postCount && postCount >= 50) {
    const { data } = await awardBadge(userId, 'fifty_posts');
    if (data) awarded.push('fifty_posts');
  }

  // Check AI image count for this user's posts
  const { data: userAiPosts } = await supabase
    .from('posts')
    .select('id, ai_metadata!inner(id)')
    .eq('user_id', userId)
    .eq('is_archived', false);

  const userAiCount = userAiPosts?.length || 0;

  if (userAiCount >= 1) {
    const { data } = await awardBadge(userId, 'first_ai');
    if (data) awarded.push('first_ai');
  }
  if (userAiCount >= 10) {
    const { data } = await awardBadge(userId, 'ten_ai');
    if (data) awarded.push('ten_ai');
  }

  // Check remix count
  const { count: remixCount } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('remix_of_post_id', 'is', null);

  if (remixCount && remixCount >= 1) {
    const { data } = await awardBadge(userId, 'first_remix');
    if (data) awarded.push('first_remix');
  }
  if (remixCount && remixCount >= 10) {
    const { data } = await awardBadge(userId, 'ten_remixes');
    if (data) awarded.push('ten_remixes');
  }

  return awarded;
}

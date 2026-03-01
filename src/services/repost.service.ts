import { supabase } from '@/lib/supabase';
import type { Repost, Profile } from '@/types';

const REPOST_PAGE_SIZE = 20;

/**
 * Repost a post (with optional quote text).
 * Inserts the repost row and increments the post's repost_count.
 */
export async function repost(userId: string, postId: string, quoteText?: string) {
  const { data, error } = await supabase
    .from('reposts')
    .insert({ user_id: userId, post_id: postId, quote_text: quoteText ?? null })
    .select()
    .single();

  if (!error) {
    // Increment the repost_count on the post
    const { data: post } = await supabase
      .from('posts')
      .select('repost_count')
      .eq('id', postId)
      .single();

    if (post) {
      await supabase
        .from('posts')
        .update({ repost_count: ((post as any).repost_count || 0) + 1 } as any)
        .eq('id', postId);
    }
  }

  return { data: data as unknown as Repost | null, error };
}

/**
 * Remove a repost and decrement the post's repost_count.
 */
export async function unrepost(userId: string, postId: string) {
  const { error } = await supabase
    .from('reposts')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);

  if (!error) {
    const { data: post } = await supabase
      .from('posts')
      .select('repost_count')
      .eq('id', postId)
      .single();

    if (post) {
      await supabase
        .from('posts')
        .update({ repost_count: Math.max((post.repost_count || 0) - 1, 0) } as any)
        .eq('id', postId);
    }
  }

  return { error };
}

/**
 * Get paginated list of users who reposted a post.
 */
export async function getReposts(postId: string, page = 0) {
  const from = page * REPOST_PAGE_SIZE;
  const to = from + REPOST_PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('reposts')
    .select('*, user:profiles!user_id(*)')
    .eq('post_id', postId)
    .order('created_at', { ascending: false })
    .range(from, to);

  return {
    data: (data || []) as unknown as (Repost & { user: Profile })[],
    error,
  };
}

/**
 * Check if a user has reposted a specific post.
 */
export async function hasReposted(userId: string, postId: string) {
  const { data } = await supabase
    .from('reposts')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();

  return !!data;
}

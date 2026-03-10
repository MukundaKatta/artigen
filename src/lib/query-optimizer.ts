/**
 * Query optimizer for Supabase queries.
 *
 * Addresses common performance issues:
 * 1. N+1 query problem (e.g., fetching likes for each post separately)
 * 2. Over-fetching columns
 * 3. Missing pagination
 * 4. Redundant queries for the same data
 */

import { supabase } from '@/lib/supabase';
import { deduplicatedFetch, cacheKey } from '@/lib/api-cache';

/**
 * Batch check if a user has liked/saved/followed a set of items.
 * Replaces N individual queries with 1 batch query.
 */
export async function batchCheckRelation(
  table: 'likes' | 'saved_posts' | 'follows',
  userId: string,
  relatedColumn: string,
  relatedIds: string[],
): Promise<Set<string>> {
  if (relatedIds.length === 0) return new Set();

  const key = cacheKey(table, 'batch', userId, relatedIds.sort().join(','));

  return deduplicatedFetch(
    key,
    async () => {
      const { data } = await supabase
        .from(table)
        .select(relatedColumn)
        .eq('user_id', userId)
        .in(relatedColumn, relatedIds);

      return new Set((data || []).map((row: any) => row[relatedColumn] as string));
    },
    15_000, // 15 second cache for relation checks
  );
}

/**
 * Optimized feed query that fetches posts with all related data
 * in minimal round-trips.
 */
export async function optimizedFeedQuery(
  userId: string,
  followingIds: string[],
  page: number,
  pageSize: number,
) {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const feedUserIds = [...followingIds, userId];

  // Single query for posts with user, media, and AI metadata
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, user:profiles!user_id(*), media:post_media(*), ai_metadata(*)')
    .in('user_id', feedUserIds)
    .eq('is_archived', false)
    .eq('is_draft', false)
    .is('scheduled_at', null)
    .in('audience', ['everyone', 'close_friends'])
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error || !posts || posts.length === 0) {
    return { posts: posts || [], likedIds: new Set<string>(), savedIds: new Set<string>() };
  }

  const postIds = posts.map((p: any) => p.id as string);

  // Batch check likes and saves in parallel (2 queries instead of 2N)
  const [likedIds, savedIds] = await Promise.all([
    batchCheckRelation('likes', userId, 'post_id', postIds),
    batchCheckRelation('saved_posts', userId, 'post_id', postIds),
  ]);

  return { posts, likedIds, savedIds };
}

/**
 * Prefetch the next page of data while the user is viewing the current page.
 * Called when the user scrolls past a threshold.
 */
export function prefetchNextPage(
  queryKey: string,
  fetcher: () => Promise<unknown>,
): void {
  const key = cacheKey('prefetch', queryKey);
  // Fire and forget — just populate the cache
  deduplicatedFetch(key, fetcher, 60_000).catch(() => {});
}

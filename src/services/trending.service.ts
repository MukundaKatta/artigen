import { supabase } from '@/lib/supabase';
import { EXPLORE_PAGE_SIZE } from '@/lib/constants';
import type { FeedPost, PostWithUser } from '@/types';

// ── Trending Posts (engagement-scored) ────────────────────────────

export type TrendingPost = FeedPost & {
  trending_score: number;
};

/**
 * Fetch posts ranked by engagement score using the database function.
 * Falls back to a client-side query if the RPC function is not available.
 */
export async function getTrendingPosts(
  page = 0,
  pageSize = EXPLORE_PAGE_SIZE,
  viewerId?: string,
) {
  const offset = page * pageSize;

  // Try the database function first (may not be deployed yet)
  const { data: rpcData, error: rpcError } = await (supabase.rpc as any)(
    'get_trending_posts',
    {
      p_limit: pageSize,
      p_offset: offset,
      p_viewer_id: viewerId ?? null,
    },
  );

  if (!rpcError && rpcData) {
    // RPC returns flat rows; we need to re-shape into TrendingPost format
    const posts: TrendingPost[] = (rpcData as any[]).map((row: any) => ({
      ...row,
      trending_score: row.trending_score ?? 0,
      isLiked: row.is_liked ?? false,
      isSaved: row.is_saved ?? false,
      user: {
        id: row.user_id,
        username: row.username,
        full_name: row.full_name,
        avatar_url: row.avatar_url,
        is_verified: row.is_verified,
      },
      media: [],
    } as unknown as TrendingPost));

    // Batch-fetch media for all returned posts
    if (posts.length > 0) {
      const postIds = posts.map((p) => p.id);
      const { data: mediaData } = await supabase
        .from('post_media')
        .select('*')
        .in('post_id', postIds)
        .order('sort_order', { ascending: true });

      if (mediaData) {
        const mediaByPost = new Map<string, typeof mediaData>();
        for (const m of mediaData) {
          const list = mediaByPost.get(m.post_id) || [];
          list.push(m);
          mediaByPost.set(m.post_id, list);
        }
        for (const post of posts) {
          (post as any).media = mediaByPost.get(post.id) || [];
        }
      }
    }

    return { data: posts, error: null };
  }

  // Fallback: client-side trending query (no RPC function deployed yet)
  return getTrendingPostsFallback(page, pageSize, viewerId);
}

/**
 * Client-side fallback that approximates the trending algorithm.
 * Uses likes_count + comments_count as a proxy since we can't do
 * the full scoring formula client-side.
 */
async function getTrendingPostsFallback(
  page: number,
  pageSize: number,
  viewerId?: string,
) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  // Fetch recent posts ordered by engagement (simple approximation)
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, user:profiles!user_id(*), media:post_media(*), ai_metadata(*)')
    .eq('is_archived', false)
    .eq('is_draft', false)
    .is('scheduled_at', null)
    .eq('audience', 'everyone')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('likes_count', { ascending: false })
    .range(from, to);

  if (error || !posts) return { data: [] as TrendingPost[], error };

  // Batch check likes and saves for viewer
  let likedPostIds = new Set<string>();
  let savedPostIds = new Set<string>();

  if (viewerId && posts.length > 0) {
    const postIds = posts.map((p) => p.id);
    const [likesResult, savesResult] = await Promise.all([
      supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', viewerId)
        .in('post_id', postIds),
      supabase
        .from('saved_posts')
        .select('post_id')
        .eq('user_id', viewerId)
        .in('post_id', postIds),
    ]);
    likedPostIds = new Set((likesResult.data || []).map((l) => l.post_id));
    savedPostIds = new Set((savesResult.data || []).map((s) => s.post_id));
  }

  // Calculate approximate trending score client-side
  const now = Date.now();
  const trendingPosts: TrendingPost[] = (posts as unknown as PostWithUser[]).map(
    (post) => {
      const hoursAge = (now - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
      const score =
        (post.likes_count * 3 + post.comments_count * 5) /
        Math.pow(hoursAge + 2, 1.5);
      return {
        ...post,
        isLiked: likedPostIds.has(post.id),
        isSaved: savedPostIds.has(post.id),
        trending_score: score,
      };
    },
  );

  // Sort by score descending (the DB order was by likes_count, re-sort by score)
  trendingPosts.sort((a, b) => b.trending_score - a.trending_score);

  return { data: trendingPosts, error: null };
}

// ── Trending Prompts ──────────────────────────────────────────────

export async function getTrendingPrompts(limit = 20) {
  const { data, error } = await supabase
    .from('trending_prompts')
    .select('*')
    .order('use_count', { ascending: false })
    .order('total_likes', { ascending: false })
    .limit(limit);
  return { data, error };
}

export async function getTrendingStyles(limit = 20) {
  const { data, error } = await supabase
    .from('trending_styles')
    .select('*')
    .order('post_count', { ascending: false })
    .order('total_likes', { ascending: false })
    .limit(limit);
  return { data, error };
}

import { supabase } from '@/lib/supabase';
import { EXPLORE_PAGE_SIZE } from '@/lib/constants';
import type { FeedPost, PostWithUser, PostMedia } from '@/types';

// ── Trending Posts (engagement-scored) ────────────────────────────

export type TrendingPost = FeedPost & {
  trending_score: number;
};

/** Shape of rows returned by the get_trending_posts RPC function. */
type TrendingRpcRow = {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  is_verified: boolean;
  caption: string | null;
  post_type: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  trending_score: number;
  is_liked: boolean;
  is_saved: boolean;
  is_archived: boolean;
  is_draft: boolean;
  is_pinned: boolean;
  pinned_at: string | null;
  audience: string;
  location: string | null;
  scheduled_at: string | null;
  remix_of_post_id: string | null;
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
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'get_trending_posts',
    {
      p_limit: pageSize,
      p_offset: offset,
      p_viewer_id: viewerId ?? null,
    },
  );

  if (!rpcError && rpcData) {
    // RPC returns flat rows; re-shape into TrendingPost format
    const rows = rpcData as unknown as TrendingRpcRow[];
    const posts: TrendingPost[] = rows.map((row) => ({
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
      media: [] as PostMedia[],
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
        const mediaByPost = new Map<string, PostMedia[]>();
        for (const m of mediaData) {
          const list = mediaByPost.get(m.post_id) || [];
          list.push(m as PostMedia);
          mediaByPost.set(m.post_id, list);
        }
        for (const post of posts) {
          // Assign fetched media to each post
          Object.assign(post, { media: mediaByPost.get(post.id) || [] });
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

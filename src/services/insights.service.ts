import { supabase } from '@/lib/supabase';
import type { PostInsights } from '@/types';

export async function trackView(postId: string, viewerId: string | null, source: string = 'feed') {
  const { error } = await supabase
    .from('post_views')
    .insert({
      post_id: postId,
      viewer_id: viewerId,
      source: source as any,
    });
  return { error };
}

export async function getPostInsights(postId: string): Promise<{ data: PostInsights | null; error: Error | null }> {
  // Get views count
  const { count: totalViews } = await supabase
    .from('post_views')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);

  // Get unique viewers
  const { data: viewers } = await supabase
    .from('post_views')
    .select('viewer_id')
    .eq('post_id', postId)
    .not('viewer_id', 'is', null);

  const uniqueViewers = new Set(
    ((viewers ?? []) as Array<{ viewer_id: string }>).map((v) => v.viewer_id),
  ).size;

  // Get post stats
  const { data: post } = await supabase
    .from('posts')
    .select('likes_count, comments_count')
    .eq('id', postId)
    .single();

  // Get saves count
  const { count: saves } = await supabase
    .from('saved_posts')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);

  // Get source breakdown
  const { data: sourceData } = await supabase
    .from('post_views')
    .select('source')
    .eq('post_id', postId);

  const sourceBreakdown: Record<string, number> = {};
  for (const s of sourceData || []) {
    sourceBreakdown[s.source] = (sourceBreakdown[s.source] || 0) + 1;
  }

  const insights: PostInsights = {
    total_views: totalViews || 0,
    unique_viewers: uniqueViewers,
    likes: post?.likes_count ?? 0,
    comments: post?.comments_count ?? 0,
    saves: saves || 0,
    source_breakdown: sourceBreakdown,
  };

  return { data: insights, error: null };
}

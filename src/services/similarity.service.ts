import { supabase } from '@/lib/supabase';

export async function findSimilarPosts(postId: string, limit = 20) {
  const { data: embedding } = await supabase
    .from('post_embeddings')
    .select('embedding')
    .eq('post_id', postId)
    .single();

  if (!embedding) return { data: [], error: null };

  const { data, error } = await supabase.rpc('search_similar_posts', {
    query_embedding: embedding.embedding,
    match_threshold: 0.7,
    match_count: limit,
    exclude_post_id: postId,
  });

  if (!data || data.length === 0) return { data: data || [], error };

  // Enrich results with media URLs from post_media
  const postIds = data.map((r: { post_id: string }) => r.post_id);
  const { data: media } = await supabase
    .from('post_media')
    .select('post_id, media_url')
    .in('post_id', postIds)
    .order('sort_order', { ascending: true });

  const mediaMap = new Map<string, string>();
  if (media) {
    for (const m of media) {
      // Keep only the first media per post (lowest sort_order)
      if (!mediaMap.has(m.post_id)) {
        mediaMap.set(m.post_id, m.media_url);
      }
    }
  }

  const enriched = data.map((r: { post_id: string; similarity: number }) => ({
    ...r,
    media_url: mediaMap.get(r.post_id) || null,
  }));

  return { data: enriched, error };
}

export async function searchByImage(imageUrl: string, limit = 20) {
  const { data, error } = await supabase.functions.invoke('embed-image', {
    body: { image_url: imageUrl, search_only: true, match_count: limit },
  });
  return { data: data?.results || [], error };
}

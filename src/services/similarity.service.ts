import { supabase } from '@/lib/supabase';

/**
 * Find posts visually similar to a given post via pgvector embeddings.
 *
 * Reads the post's embedding from `post_embeddings`, then invokes the
 * `search_similar_posts` RPC with a cosine-similarity threshold of 0.7
 * (anything below 0.7 is considered unrelated). Returns up to `limit`
 * matches sorted by similarity, enriched with the post's first media URL.
 *
 * @param postId — anchor post to find neighbors of
 * @param limit — max results (default 20)
 * @returns `{ data: PostRow[], error }`. Empty array (not null) if the
 *          post has no embedding yet or no matches exceed threshold.
 */
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

/**
 * Reverse-image search: embeds an arbitrary image URL and finds matching
 * posts in one round trip.
 *
 * Calls the `embed-image` edge function with `search_only: true` so the
 * function doesn't persist the embedding — it only computes it on the fly
 * and queries pgvector. Use `findSimilarPosts` when you already have a
 * stored post; use this when the user uploads/pastes a new image.
 *
 * @param imageUrl — URL the function can fetch (Supabase storage or public)
 * @param limit — max results (default 20)
 * @returns `{ data: SearchResult[], error }` where each result has
 *          `post_id`, `similarity`, and basic post metadata.
 */
export async function searchByImage(imageUrl: string, limit = 20) {
  const { data, error } = await supabase.functions.invoke('embed-image', {
    body: { image_url: imageUrl, search_only: true, match_count: limit },
  });
  const payload = data as { results?: unknown[] } | null;
  return { data: payload?.results ?? [], error };
}

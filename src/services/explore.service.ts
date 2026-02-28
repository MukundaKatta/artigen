import { supabase } from '@/lib/supabase';
import { EXPLORE_PAGE_SIZE } from '@/lib/constants';
import type { PostWithUser } from '@/types';

type Hashtag = { id: string; name: string; post_count: number };

export async function getExploreFeed(page = 0, aiOnly = false) {
  const from = page * EXPLORE_PAGE_SIZE;
  const to = from + EXPLORE_PAGE_SIZE - 1;

  if (aiOnly) {
    // Get post IDs that have AI metadata
    const { data: aiPosts } = await supabase
      .from('ai_metadata')
      .select('post_id')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!aiPosts || aiPosts.length === 0) return { data: [] as PostWithUser[], error: null };

    const postIds = aiPosts.map((a: any) => a.post_id as string);

    const { data, error } = await supabase
      .from('posts')
      .select('*, user:profiles!user_id(*), media:post_media(*), ai_metadata(*)')
      .in('id', postIds)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    return { data: (data || []) as unknown as PostWithUser[], error };
  }

  const { data, error } = await supabase
    .from('posts')
    .select('*, user:profiles!user_id(*), media:post_media(*), ai_metadata(*)')
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: (data || []) as unknown as PostWithUser[], error };
}

export async function searchPosts(query: string, limit = 20) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, user:profiles!user_id(*), media:post_media(*), ai_metadata(*)')
    .ilike('caption', `%${query}%`)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data: (data || []) as unknown as PostWithUser[], error };
}

export async function searchByPrompt(query: string, limit = 20) {
  const { data: aiPosts, error } = await supabase
    .from('ai_metadata')
    .select('post_id')
    .ilike('prompt', `%${query}%`)
    .limit(limit);

  if (!aiPosts || aiPosts.length === 0) return { data: [] as PostWithUser[], error };

  const postIds = aiPosts.map((a: any) => a.post_id as string);

  const { data: posts, error: postError } = await supabase
    .from('posts')
    .select('*, user:profiles!user_id(*), media:post_media(*), ai_metadata(*)')
    .in('id', postIds)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  return { data: (posts || []) as unknown as PostWithUser[], error: postError };
}

export async function searchByModel(modelId: string, limit = 20) {
  const { data: aiPosts } = await supabase
    .from('ai_metadata')
    .select('post_id')
    .eq('model_id', modelId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!aiPosts || aiPosts.length === 0) return { data: [] as PostWithUser[], error: null };

  const postIds = aiPosts.map((a: any) => a.post_id as string);

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, user:profiles!user_id(*), media:post_media(*), ai_metadata(*)')
    .in('id', postIds)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  return { data: (posts || []) as unknown as PostWithUser[], error };
}

export async function searchHashtags(query: string, limit = 20) {
  const { data, error } = await supabase
    .from('hashtags')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('post_count', { ascending: false })
    .limit(limit);

  return { data: (data || []) as unknown as Hashtag[], error };
}

export async function getHashtagPosts(hashtagName: string, page = 0) {
  const from = page * EXPLORE_PAGE_SIZE;
  const to = from + EXPLORE_PAGE_SIZE - 1;

  // Get the hashtag
  const { data: hashtag } = await supabase
    .from('hashtags')
    .select('id, name, post_count')
    .eq('name', hashtagName.toLowerCase())
    .maybeSingle();

  const typedHashtag = hashtag as unknown as Hashtag | null;
  if (!typedHashtag) return { data: [], hashtag: null, error: null };

  // Get post IDs linked to this hashtag
  const { data: links } = await supabase
    .from('post_hashtags')
    .select('post_id')
    .eq('hashtag_id', typedHashtag.id)
    .range(from, to);

  if (!links || links.length === 0) return { data: [], hashtag: typedHashtag, error: null };

  const postIds = links.map((l: any) => l.post_id as string);

  // Fetch full posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, user:profiles!user_id(*), media:post_media(*)')
    .in('id', postIds)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  return {
    data: (posts || []) as unknown as PostWithUser[],
    hashtag: typedHashtag,
    error,
  };
}

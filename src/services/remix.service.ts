import { supabase } from '@/lib/supabase';

const REMIX_PAGE_SIZE = 20;

// Get remixes of a specific post
export async function getRemixes(postId: string, page = 0) {
  const from = page * REMIX_PAGE_SIZE;
  const to = from + REMIX_PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('posts')
    .select('*, user:profiles!user_id(*), media:post_media(*), ai_metadata(*)')
    .eq('remix_of_post_id', postId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: data || [], error };
}

// Get remix count for a post
export async function getRemixCount(postId: string) {
  const { count, error } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('remix_of_post_id', postId)
    .eq('is_archived', false);

  return { count: count || 0, error };
}

// Get original post info for a remix (lightweight)
export async function getRemixOriginal(postId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, user:profiles!user_id(id, username, avatar_url)')
    .eq('id', postId)
    .single();

  return { data, error };
}

// Get the full remix chain (original → remixes of remixes)
export async function getRemixChain(postId: string) {
  // Walk up to find the root
  let currentId = postId;
  const chain: string[] = [currentId];

  for (let i = 0; i < 10; i++) {
    const { data } = await supabase
      .from('posts')
      .select('remix_of_post_id')
      .eq('id', currentId)
      .single();

    if (!data?.remix_of_post_id) break;
    chain.unshift(data.remix_of_post_id);
    currentId = data.remix_of_post_id;
  }

  return chain;
}

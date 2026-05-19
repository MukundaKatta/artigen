import { supabase } from '@/lib/supabase';

/**
 * Create a blend feed between two users (idempotent by sorted user pair).
 * Optionally links the blend to an existing conversation.
 */
export async function createBlend(userAId: string, userBId: string, conversationId?: string) {
  const [a, b] = [userAId, userBId].sort();
  const { data, error } = await supabase
    .from('blend_feeds')
    .insert({ user_a_id: a, user_b_id: b, conversation_id: conversationId })
    .select()
    .single();
  return { data, error };
}

/**
 * Fetch a single blend feed row by id.
 */
export async function getBlend(blendId: string) {
  const { data, error } = await supabase.from('blend_feeds').select('*').eq('id', blendId).single();
  return { data, error };
}

/**
 * Fetch a paginated slice of posts in a blend feed (server-side RPC).
 * Page size is 20.
 */
export async function getBlendFeed(blendId: string, page = 0) {
  const { data, error } = await supabase.rpc('get_blend_feed', {
    blend_id: blendId,
    page_offset: page * 20,
    page_limit: 20,
  });
  return { data, error };
}

/**
 * Permanently delete a blend feed.
 */
export async function deleteBlend(blendId: string) {
  const { error } = await supabase.from('blend_feeds').delete().eq('id', blendId);
  return { error };
}

/**
 * List active blend feeds the user is a participant in.
 * Joins both participant profiles for display.
 */
export async function getMyBlends(userId: string) {
  const { data, error } = await supabase
    .from('blend_feeds')
    .select(
      '*, user_a:profiles!user_a_id(id, username, avatar_url), user_b:profiles!user_b_id(id, username, avatar_url)',
    )
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .eq('is_active', true);
  return { data, error };
}

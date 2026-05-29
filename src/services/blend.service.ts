import { supabase } from '@/lib/supabase';

/**
 * Create a "blend" — a shared feed that mixes two users' content, optionally
 * tied to a conversation. The (user_a, user_b) pair is sorted before insert so
 * the same two users always map to one canonical row regardless of order.
 *
 * @returns `{ data: blend_feeds row | null, error }`
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

/** Fetch a single blend_feeds row by id. */
export async function getBlend(blendId: string) {
  const { data, error } = await supabase
    .from('blend_feeds')
    .select('*')
    .eq('id', blendId)
    .single();
  return { data, error };
}

/**
 * Fetch one page (20 items) of the merged feed for a blend via the
 * `get_blend_feed` RPC, which interleaves both users' posts server-side.
 *
 * @param page — zero-based page index (offset = page * 20)
 */
export async function getBlendFeed(blendId: string, page = 0) {
  const { data, error } = await supabase.rpc('get_blend_feed', {
    blend_id: blendId,
    page_offset: page * 20,
    page_limit: 20,
  });
  return { data, error };
}

/** Hard-delete a blend. The RLS policy restricts this to either participant. */
export async function deleteBlend(blendId: string) {
  const { error } = await supabase
    .from('blend_feeds')
    .delete()
    .eq('id', blendId);
  return { error };
}

/** List the current user's active blends, with both participants' profiles joined. */
export async function getMyBlends(userId: string) {
  const { data, error } = await supabase
    .from('blend_feeds')
    .select('*, user_a:profiles!user_a_id(id, username, avatar_url), user_b:profiles!user_b_id(id, username, avatar_url)')
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .eq('is_active', true);
  return { data, error };
}

import { supabase } from '@/lib/supabase';

export async function createBlend(userAId: string, userBId: string, conversationId?: string) {
  const [a, b] = [userAId, userBId].sort();
  const { data, error } = await supabase
    .from('blend_feeds')
    .insert({ user_a_id: a, user_b_id: b, conversation_id: conversationId })
    .select()
    .single();
  return { data, error };
}

export async function getBlend(blendId: string) {
  const { data, error } = await supabase
    .from('blend_feeds')
    .select('*')
    .eq('id', blendId)
    .single();
  return { data, error };
}

export async function getBlendFeed(blendId: string, page = 0) {
  const { data, error } = await supabase.rpc('get_blend_feed', {
    blend_id: blendId,
    page_offset: page * 20,
    page_limit: 20,
  });
  return { data, error };
}

export async function deleteBlend(blendId: string) {
  const { error } = await supabase
    .from('blend_feeds')
    .delete()
    .eq('id', blendId);
  return { error };
}

export async function getMyBlends(userId: string) {
  const { data, error } = await supabase
    .from('blend_feeds')
    .select('*, user_a:profiles!user_a_id(id, username, avatar_url), user_b:profiles!user_b_id(id, username, avatar_url)')
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .eq('is_active', true);
  return { data, error };
}

import { supabase } from '@/lib/supabase';

export async function getProvenance(postId: string) {
  const { data, error } = await supabase
    .from('art_provenance')
    .select('*, author:profiles!author_id(id, username, avatar_url)')
    .eq('post_id', postId)
    .maybeSingle();
  return { data, error };
}

export async function verifyProvenance(postId: string) {
  const { data, error } = await supabase.functions.invoke('sign-provenance', {
    body: { post_id: postId, verify_only: true },
  });
  return { data, error };
}

export async function getProvenanceByHash(contentHash: string) {
  const { data, error } = await supabase
    .from('art_provenance')
    .select('*, author:profiles!author_id(id, username, avatar_url)')
    .eq('content_hash', contentHash);
  return { data, error };
}

const PAGE_SIZE = 20;

export async function getUserProvenance(userId: string, page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('art_provenance')
    .select('*, post:posts!post_id(id), author:profiles!author_id(id, username, avatar_url)')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: data || [], error };
}

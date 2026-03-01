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

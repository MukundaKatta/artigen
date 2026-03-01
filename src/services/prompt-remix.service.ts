import { supabase } from '@/lib/supabase';

export async function createPromptRemix(params: {
  originalPostId: string;
  remixedPostId: string;
  originalPrompt: string;
  modifiedPrompt: string;
  originalAuthorId: string;
  remixerId: string;
  changesDescription?: string;
}) {
  const { data, error } = await supabase
    .from('prompt_remixes')
    .insert({
      original_post_id: params.originalPostId,
      remixed_post_id: params.remixedPostId,
      original_prompt: params.originalPrompt,
      modified_prompt: params.modifiedPrompt,
      original_author_id: params.originalAuthorId,
      remixer_id: params.remixerId,
      changes_description: params.changesDescription || '',
    })
    .select()
    .single();
  return { data, error };
}

export async function getRemixesOfPrompt(originalPostId: string) {
  const { data, error } = await supabase
    .from('prompt_remixes')
    .select('*, remixer:profiles!remixer_id(id, username, avatar_url), remixed_post:posts!remixed_post_id(*, media:post_media(*))')
    .eq('original_post_id', originalPostId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getRemixCredits(remixedPostId: string) {
  const { data, error } = await supabase
    .from('prompt_remixes')
    .select('*, original_author:profiles!original_author_id(id, username, avatar_url), original_post:posts!original_post_id(id)')
    .eq('remixed_post_id', remixedPostId)
    .maybeSingle();
  return { data, error };
}

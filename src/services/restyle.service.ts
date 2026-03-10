import { supabase } from '@/lib/supabase';

export async function getStylePresets(category?: string) {
  let q = supabase
    .from('style_presets')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (category) q = q.eq('category', category);
  const { data, error } = await q;
  return { data, error };
}

export async function createRestyleJob(params: {
  userId: string;
  sourcePostId?: string;
  sourceImageUrl: string;
  stylePresetId?: string;
  customStylePrompt?: string;
}) {
  const { data, error } = await supabase
    .from('restyle_jobs')
    .insert({
      user_id: params.userId,
      source_post_id: params.sourcePostId,
      source_image_url: params.sourceImageUrl,
      style_preset_id: params.stylePresetId,
      custom_style_prompt: params.customStylePrompt,
      status: 'pending',
    })
    .select()
    .single();

  if (data) {
    supabase.functions.invoke('restyle', { body: { job_id: data.id } }).catch((err) => {
      console.error('[restyle] edge function failed:', err);
      supabase.from('restyle_jobs').update({ status: 'failed', error_message: 'Failed to start processing' }).eq('id', data.id);
    });
  }
  return { data, error };
}

export async function getRestyleJob(jobId: string) {
  const { data, error } = await supabase
    .from('restyle_jobs')
    .select('*, style_preset:style_presets(*)')
    .eq('id', jobId)
    .single();
  return { data, error };
}

export async function getMyRestyleJobs(userId: string) {
  const { data, error } = await supabase
    .from('restyle_jobs')
    .select('*, style_preset:style_presets(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

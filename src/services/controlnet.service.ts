import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function getControlNetPresets(controlType?: string) {
  let q = supabase.from('controlnet_presets').select('*').eq('is_active', true).order('sort_order');

  if (controlType) q = q.eq('control_type', controlType);
  const { data, error } = await q;
  return { data, error };
}

export async function createControlNetJob(params: {
  userId: string;
  sourcePostId?: string;
  controlImageUrl: string;
  controlType: string;
  prompt: string;
  negativePrompt?: string;
  controlStrength?: number;
}) {
  const { data, error } = await supabase
    .from('controlnet_jobs')
    .insert({
      user_id: params.userId,
      source_post_id: params.sourcePostId,
      control_image_url: params.controlImageUrl,
      control_type: params.controlType,
      prompt: params.prompt,
      negative_prompt: params.negativePrompt,
      control_strength: params.controlStrength ?? 1.0,
      status: 'pending',
    })
    .select()
    .single();

  if (data) {
    void (async () => {
      try {
        await supabase.functions.invoke('controlnet', { body: { job_id: data.id } });
      } catch (err) {
        logger.warn('ControlNet invoke failed:', err);
        await supabase
          .from('controlnet_jobs')
          .update({ status: 'failed', error_message: 'Failed to start processing' })
          .eq('id', data.id);
      }
    })();
  }
  return { data, error };
}

export async function getControlNetJob(jobId: string) {
  const { data, error } = await supabase
    .from('controlnet_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  return { data, error };
}

export async function getMyControlNetJobs(userId: string) {
  const { data, error } = await supabase
    .from('controlnet_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

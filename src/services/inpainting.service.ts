import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function createInpaintingJob(params: {
  userId: string;
  sourcePostId?: string;
  sourceImageUrl: string;
  maskImageUrl: string;
  prompt: string;
  negativePrompt?: string;
}) {
  const { data, error } = await supabase
    .from('inpainting_jobs')
    .insert({
      user_id: params.userId,
      source_post_id: params.sourcePostId,
      source_image_url: params.sourceImageUrl,
      mask_image_url: params.maskImageUrl,
      prompt: params.prompt,
      negative_prompt: params.negativePrompt,
      status: 'pending',
    })
    .select()
    .single();

  if (data) {
    void (async () => {
      try {
        await supabase.functions.invoke('inpaint', { body: { job_id: data.id } });
      } catch (err) {
        logger.warn('Inpaint invoke failed:', err);
        await supabase
          .from('inpainting_jobs')
          .update({ status: 'failed', error_message: 'Failed to start processing' })
          .eq('id', data.id);
      }
    })();
  }
  return { data, error };
}

export async function getInpaintingJob(jobId: string) {
  const { data, error } = await supabase
    .from('inpainting_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  return { data, error };
}

export async function getMyInpaintingJobs(userId: string) {
  const { data, error } = await supabase
    .from('inpainting_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

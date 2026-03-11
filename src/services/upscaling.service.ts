import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function createUpscalingJob(params: {
  userId: string;
  sourcePostId?: string;
  sourceImageUrl: string;
  scaleFactor?: number;
  originalWidth?: number;
  originalHeight?: number;
}) {
  const { data, error } = await supabase
    .from('upscaling_jobs')
    .insert({
      user_id: params.userId,
      source_post_id: params.sourcePostId,
      source_image_url: params.sourceImageUrl,
      scale_factor: params.scaleFactor || 2,
      original_width: params.originalWidth,
      original_height: params.originalHeight,
      status: 'pending',
    })
    .select()
    .single();

  if (data) {
    supabase.functions.invoke('upscale', { body: { job_id: data.id } }).catch((err) => {
      logger.warn('Upscale invoke failed:', err);
      supabase.from('upscaling_jobs').update({ status: 'failed', error_message: 'Failed to start processing' }).eq('id', data.id);
    });
  }
  return { data, error };
}

export async function getUpscalingJob(jobId: string) {
  const { data, error } = await supabase
    .from('upscaling_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  return { data, error };
}

export async function getMyUpscalingJobs(userId: string) {
  const { data, error } = await supabase
    .from('upscaling_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

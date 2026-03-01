import { supabase } from '@/lib/supabase';

export async function createOutpaintingJob(params: {
  userId: string;
  sourcePostId?: string;
  sourceImageUrl: string;
  direction: 'left' | 'right' | 'up' | 'down' | 'all';
  expandPixels?: number;
  prompt?: string;
}) {
  const { data, error } = await supabase
    .from('outpainting_jobs')
    .insert({
      user_id: params.userId,
      source_post_id: params.sourcePostId,
      source_image_url: params.sourceImageUrl,
      direction: params.direction,
      expand_pixels: params.expandPixels || 256,
      prompt: params.prompt,
      status: 'pending',
    })
    .select()
    .single();

  if (data) {
    supabase.functions.invoke('outpaint', { body: { job_id: data.id } }).catch(() => {});
  }
  return { data, error };
}

export async function getOutpaintingJob(jobId: string) {
  const { data, error } = await supabase
    .from('outpainting_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  return { data, error };
}

export async function getMyOutpaintingJobs(userId: string) {
  const { data, error } = await supabase
    .from('outpainting_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

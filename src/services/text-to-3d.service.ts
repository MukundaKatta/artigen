import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function createText3DJob(
  userId: string,
  prompt: string,
  negativePrompt?: string,
  modelId?: string,
  settings?: Record<string, any>,
) {
  const { data, error } = await supabase
    .from('text_to_3d_jobs')
    .insert({
      user_id: userId,
      prompt,
      negative_prompt: negativePrompt,
      model_id: modelId ?? 'meshy-ai/meshy',
      settings: settings ?? {},
      status: 'pending',
    })
    .select()
    .single();

  if (data) {
    // Explicit fire-and-forget; the caller returns immediately while the job runs.
    void (async () => {
      try {
        await supabase.functions.invoke('text-to-3d', { body: { job_id: data.id } });
      } catch (err) {
        logger.warn('Text-to-3D invoke failed:', err);
        await supabase
          .from('text_to_3d_jobs')
          .update({ status: 'failed', error_message: 'Failed to start processing' })
          .eq('id', data.id);
      }
    })();
  }

  return { data, error };
}

export async function getText3DJob(jobId: string) {
  const { data, error } = await supabase
    .from('text_to_3d_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  return { data, error };
}

export async function getMyText3DJobs(userId: string) {
  const { data, error } = await supabase
    .from('text_to_3d_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

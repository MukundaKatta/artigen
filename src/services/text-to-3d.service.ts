import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/**
 * Enqueue a text-to-3D generation job and kick off the `text-to-3d` edge
 * function (fire-and-forget; the worker drives the row through
 * pending → processing → completed/failed). Poll via {@link getText3DJob}.
 *
 * @param modelId — defaults to 'meshy-ai/meshy'
 * @param settings — opaque model-specific knobs, persisted as JSON
 * @returns `{ data: text_to_3d_jobs row | null, error }`
 */
export async function createText3DJob(
  userId: string,
  prompt: string,
  negativePrompt?: string,
  modelId?: string,
  settings?: Record<string, any>
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
    supabase.functions.invoke('text-to-3d', { body: { job_id: data.id } }).catch((err) => {
      logger.warn('Text-to-3D invoke failed:', err);
      supabase.from('text_to_3d_jobs').update({ status: 'failed', error_message: 'Failed to start processing' }).eq('id', data.id);
    });
  }

  return { data, error };
}

/** Fetch a single text-to-3D job by id (used for status polling). */
export async function getText3DJob(jobId: string) {
  const { data, error } = await supabase
    .from('text_to_3d_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  return { data, error };
}

/** List the current user's text-to-3D jobs, newest first. */
export async function getMyText3DJobs(userId: string) {
  const { data, error } = await supabase
    .from('text_to_3d_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

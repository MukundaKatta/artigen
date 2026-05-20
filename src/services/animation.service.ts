import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/**
 * Enqueue a new animation generation job.
 *
 * Costs credits — the `animate` edge function charges the user before
 * running the model (see credits.service for the deduction flow). The
 * function is invoked fire-and-forget; on success the row's status
 * transitions to `processing` then `completed`/`failed` via the worker.
 *
 * Poll for completion via `getAnimationJob` or subscribe to the
 * `animation_jobs` realtime channel.
 *
 * @param params.userId — owner of the job
 * @param params.sourcePostId — optional source post (carries its media)
 * @param params.sourceImageUrl — image to animate
 * @param params.animationType — one of 5 motion presets
 * @param params.settings — model-specific knobs (passed through opaquely)
 * @param params.durationSeconds — clamped to 1.0-5.0 server-side; default 3.0
 */
export async function createAnimationJob(params: {
  userId: string;
  sourcePostId?: string;
  sourceImageUrl: string;
  animationType: 'motion' | 'camera_pan' | 'parallax' | 'zoom' | 'morph';
  settings?: Record<string, unknown>;
  durationSeconds?: number;
}) {
  const { data, error } = await supabase
    .from('animation_jobs')
    .insert({
      user_id: params.userId,
      source_post_id: params.sourcePostId,
      source_image_url: params.sourceImageUrl,
      animation_type: params.animationType,
      settings: params.settings || {},
      duration_seconds: params.durationSeconds || 3.0,
      status: 'pending',
    })
    .select()
    .single();

  if (data) {
    supabase.functions.invoke('animate', { body: { job_id: data.id } }).catch(async (err) => {
      logger.warn('Animation invoke failed:', err);
      // Await the failure update so a subsequent read sees the failed row.
      await supabase
        .from('animation_jobs')
        .update({ status: 'failed', error_message: 'Failed to start processing' })
        .eq('id', data.id);
    });
  }
  return { data, error };
}

export async function getAnimationJob(jobId: string) {
  const { data, error } = await supabase
    .from('animation_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  return { data, error };
}

export async function getMyAnimations(userId: string) {
  const { data, error } = await supabase
    .from('animation_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

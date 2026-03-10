import { supabase } from '@/lib/supabase';

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
    supabase.functions.invoke('animate', { body: { job_id: data.id } }).catch((err) => {
      console.warn('Animation invoke failed:', err);
      supabase.from('animation_jobs').update({ status: 'failed', error_message: 'Failed to start processing' }).eq('id', data.id);
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

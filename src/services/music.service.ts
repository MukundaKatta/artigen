import { supabase } from '@/lib/supabase';

export async function createMusicJob(
  userId: string,
  params: {
    prompt?: string;
    mood?: string;
    durationSeconds?: number;
    genre?: string;
    postId?: string;
  }
) {
  const { data, error } = await supabase
    .from('music_generation_jobs')
    .insert({
      user_id: userId,
      post_id: params.postId,
      prompt: params.prompt,
      mood: params.mood,
      duration_seconds: params.durationSeconds ?? 30,
      genre: params.genre,
      status: 'pending',
    })
    .select()
    .single();

  if (data) {
    supabase.functions.invoke('generate-music', { body: { job_id: data.id } }).catch((err) => {
      console.warn('Music generation invoke failed:', err);
      supabase.from('music_generation_jobs').update({ status: 'failed', error_message: 'Failed to start processing' }).eq('id', data.id);
    });
  }

  return { data, error };
}

export async function getMusicJob(jobId: string) {
  const { data, error } = await supabase
    .from('music_generation_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  return { data, error };
}

export async function getMyMusicJobs(userId: string) {
  const { data, error } = await supabase
    .from('music_generation_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function attachMusicToPost(postId: string, musicUrl: string, musicTitle: string) {
  const { data, error } = await supabase
    .from('posts')
    .update({ music_url: musicUrl, music_title: musicTitle })
    .eq('id', postId)
    .select()
    .single();
  return { data, error };
}

import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Database } from '@/types/database';

type UserAvatarUpdate = Database['public']['Tables']['user_avatars']['Update'];

// ── Types ────────────────────────────────────────────

export type AvatarStyle =
  | 'anime'
  | 'cartoon'
  | '3d'
  | 'pixel'
  | 'watercolor'
  | 'oil_painting'
  | 'cyberpunk'
  | 'fantasy'
  | 'minimalist'
  | 'pop_art';

export type AvatarGenerationJob = {
  id: string;
  user_id: string;
  source_image_urls: string[];
  style: AvatarStyle;
  prompt_modifier: string | null;
  result_urls: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
};

export type UserAvatar = {
  id: string;
  user_id: string;
  image_url: string;
  style: string;
  is_active: boolean;
  created_at: string;
};

// ── Create an avatar generation job ──────────────────

export async function createAvatarJob(
  userId: string,
  sourceImageUrls: string[],
  style: AvatarStyle,
  promptModifier?: string,
) {
  const { data, error } = await supabase
    .from('avatar_generation_jobs')
    .insert({
      user_id: userId,
      source_image_urls: sourceImageUrls,
      style,
      prompt_modifier: promptModifier,
      status: 'pending',
    })
    .select()
    .single();

  // Fire-and-forget: invoke edge function to process the job. If the
  // invoke fails, await the row update so a subsequent read sees 'failed'.
  if (data) {
    supabase.functions.invoke('generate-avatar', { body: { job_id: data.id } }).catch(async (err) => {
      logger.warn('Avatar generation invoke failed:', err);
      await supabase
        .from('avatar_generation_jobs')
        .update({ status: 'failed', error_message: 'Failed to start processing' })
        .eq('id', data.id);
    });
  }

  return { data: data as unknown as AvatarGenerationJob | null, error };
}

// ── Get a specific job ───────────────────────────────

export async function getAvatarJob(jobId: string) {
  const { data, error } = await supabase
    .from('avatar_generation_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  return { data: data as unknown as AvatarGenerationJob | null, error };
}

// ── Get all jobs for a user ──────────────────────────

export async function getMyAvatarJobs(userId: string) {
  const { data, error } = await supabase
    .from('avatar_generation_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data: (data || []) as unknown as AvatarGenerationJob[], error };
}

// ── Save an avatar to the user's collection ──────────

export async function saveAvatar(userId: string, imageUrl: string, style: string) {
  const { data, error } = await supabase
    .from('user_avatars')
    .insert({
      user_id: userId,
      image_url: imageUrl,
      style,
    })
    .select()
    .single();

  return { data: data as unknown as UserAvatar | null, error };
}

// ── Get all saved avatars for a user ─────────────────

export async function getMyAvatars(userId: string) {
  const { data, error } = await supabase
    .from('user_avatars')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data: (data || []) as unknown as UserAvatar[], error };
}

// ── Set active avatar (deactivates all others) ───────

export async function setActiveAvatar(userId: string, avatarId: string) {
  const deactivateData: UserAvatarUpdate = { is_active: false };
  const activateData: UserAvatarUpdate = { is_active: true };

  // Deactivate all avatars for this user
  await supabase
    .from('user_avatars')
    .update(deactivateData)
    .eq('user_id', userId);

  // Activate the selected one
  const { data, error } = await supabase
    .from('user_avatars')
    .update(activateData)
    .eq('id', avatarId)
    .eq('user_id', userId)
    .select()
    .single();

  return { data: data as unknown as UserAvatar | null, error };
}

// ── Remove a saved avatar ────────────────────────────

export async function removeAvatar(avatarId: string) {
  const { error } = await supabase
    .from('user_avatars')
    .delete()
    .eq('id', avatarId);

  return { error };
}

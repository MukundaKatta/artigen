import { supabase } from '@/lib/supabase';
import type { Post } from '@/types';

export async function getScheduledPosts(userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, media:post_media(*)')
    .eq('user_id', userId)
    .not('scheduled_at', 'is', null)
    .gt('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true });

  return { data: (data || []) as any[], error };
}

export async function schedulePost(postId: string, scheduledAt: Date) {
  const { error } = await supabase
    .from('posts')
    .update({
      scheduled_at: scheduledAt.toISOString(),
      is_draft: true,
    })
    .eq('id', postId);
  return { error };
}

export async function cancelSchedule(postId: string) {
  const { error } = await supabase
    .from('posts')
    .update({
      scheduled_at: null,
      is_draft: false,
    })
    .eq('id', postId);
  return { error };
}

export async function publishScheduledPost(postId: string) {
  const { error } = await supabase
    .from('posts')
    .update({
      scheduled_at: null,
      is_draft: false,
    })
    .eq('id', postId);
  return { error };
}

export async function getDraftPosts(userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, media:post_media(*)')
    .eq('user_id', userId)
    .eq('is_draft', true)
    .is('scheduled_at', null)
    .order('created_at', { ascending: false });

  return { data: (data || []) as any[], error };
}

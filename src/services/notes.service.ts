import { supabase } from '@/lib/supabase';
import type { UserNote, Profile } from '@/types';

export type NoteWithUser = UserNote & {
  user: Pick<Profile, 'id' | 'username' | 'avatar_url'>;
};

export async function createNote(
  userId: string,
  content: string,
  emoji?: string
) {
  // Delete any existing note for this user first
  await supabase.from('user_notes').delete().eq('user_id', userId);

  const { data, error } = await supabase
    .from('user_notes')
    .insert({
      user_id: userId,
      content,
      emoji: emoji || null,
    })
    .select()
    .single();

  return { data: data as unknown as UserNote | null, error };
}

export async function deleteNote(noteId: string) {
  const { error } = await supabase
    .from('user_notes')
    .delete()
    .eq('id', noteId);

  return { error };
}

export async function getFollowingNotes(userId: string) {
  // Get IDs of users the current user follows
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)
    .eq('status', 'accepted');

  const followingIds = (following || []).map((f) => f.following_id);

  if (followingIds.length === 0) {
    return { data: [] as NoteWithUser[], error: null };
  }

  const { data, error } = await supabase
    .from('user_notes')
    .select('*, user:profiles!user_id(id, username, avatar_url)')
    .in('user_id', followingIds)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  return { data: (data || []) as unknown as NoteWithUser[], error };
}

export async function getUserNote(userId: string) {
  const { data, error } = await supabase
    .from('user_notes')
    .select('*')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data: data as unknown as UserNote | null, error };
}

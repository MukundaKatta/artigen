import { supabase } from '@/lib/supabase';
import { createNotification } from '@/services/notification.service';
import type { PostCollaborator, Profile } from '@/types';

export async function inviteCollaborator(postId: string, userId: string, senderId: string) {
  const { data, error } = await supabase
    .from('post_collaborators')
    .insert({ post_id: postId, user_id: userId })
    .select()
    .single();

  if (!error) {
    createNotification({
      type: 'collab_invite',
      senderId,
      recipientId: userId,
      postId,
    });
  }

  return { data: data as unknown as PostCollaborator | null, error };
}

export async function respondToInvite(postId: string, userId: string, accept: boolean, senderId?: string) {
  const status = accept ? 'accepted' : 'declined';
  const { error } = await supabase
    .from('post_collaborators')
    .update({ status })
    .eq('post_id', postId)
    .eq('user_id', userId);

  if (!error && accept && senderId) {
    // Get post owner to notify them
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (post) {
      createNotification({
        type: 'collab_accepted',
        senderId: userId,
        recipientId: (post as { user_id: string }).user_id,
        postId,
      });
    }
  }

  return { error };
}

export async function getCollaborators(postId: string) {
  const { data, error } = await supabase
    .from('post_collaborators')
    .select('*, user:profiles!user_id(id, username, full_name, avatar_url)')
    .eq('post_id', postId)
    .eq('status', 'accepted');

  if (error || !data) return { data: [] as Profile[], error };

  type CollabRow = { user: Profile };
  const profiles = (data as unknown as CollabRow[]).map((d) => d.user);
  return { data: profiles, error: null };
}

export async function getPendingInvites(userId: string) {
  const { data, error } = await supabase
    .from('post_collaborators')
    .select('*, post:posts(*, user:profiles!user_id(id, username, avatar_url), media:post_media(*))')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

export async function removeCollaborator(postId: string, userId: string) {
  const { error } = await supabase
    .from('post_collaborators')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
  return { error };
}

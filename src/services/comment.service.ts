import { supabase } from '@/lib/supabase';
import { COMMENTS_PAGE_SIZE } from '@/lib/constants';
import { createNotification } from '@/services/notification.service';
import { sanitizeText } from '@/lib/sanitize';
import { logger } from '@/lib/logger';
import type { CommentWithUser } from '@/types';

export async function getComments(postId: string, page = 0) {
  const from = page * COMMENTS_PAGE_SIZE;
  const to = from + COMMENTS_PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('comments')
    .select('*, user:profiles!user_id(*)')
    .eq('post_id', postId)
    .is('parent_comment_id', null)
    .order('created_at', { ascending: true })
    .range(from, to);

  return { data: (data as unknown as CommentWithUser[]) || [], error };
}

export async function getReplies(commentId: string, page = 0) {
  const from = page * COMMENTS_PAGE_SIZE;
  const to = from + COMMENTS_PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('comments')
    .select('*, user:profiles!user_id(*)')
    .eq('parent_comment_id', commentId)
    .order('created_at', { ascending: true })
    .range(from, to);

  return { data: (data as unknown as CommentWithUser[]) || [], error };
}

export async function getReplyCount(commentIds: string[]) {
  if (commentIds.length === 0) return new Map<string, number>();

  const { data } = await supabase
    .from('comments')
    .select('parent_comment_id')
    .in('parent_comment_id', commentIds);

  const counts = new Map<string, number>();
  (data || []).forEach((d) => {
    const id = d.parent_comment_id;
    counts.set(id, (counts.get(id) || 0) + 1);
  });
  return counts;
}

export async function addComment(
  userId: string,
  postId: string,
  content: string,
  parentCommentId?: string
) {
  const sanitizedContent = sanitizeText(content);
  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: userId,
      post_id: postId,
      content: sanitizedContent,
      parent_comment_id: parentCommentId || null,
    })
    .select('*, user:profiles!user_id(*)')
    .single();

  // Background notification with proper error handling
  if (data && !error) {
    Promise.resolve(
      supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single()
    ).then(({ data: post }) => {
        if (post && post.user_id !== userId) {
          createNotification({
            type: 'comment',
            senderId: userId,
            recipientId: post.user_id,
            postId,
            commentId: data.id,
          })
            .catch((err: unknown) => logger.warn('Failed to create comment notification:', err));
        }
      })
      .catch((err: unknown) => logger.warn('Failed to fetch post owner for notification:', err));
  }

  return { data: data as unknown as CommentWithUser | null, error };
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);
  return { error };
}

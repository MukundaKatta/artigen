import { supabase } from '@/lib/supabase';
import { COMMENTS_PAGE_SIZE } from '@/lib/constants';
import { createNotification } from '@/services/notification.service';
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

export async function addComment(
  userId: string,
  postId: string,
  content: string,
  parentCommentId?: string
) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: userId,
      post_id: postId,
      content,
      parent_comment_id: parentCommentId || null,
    })
    .select('*, user:profiles!user_id(*)')
    .single();

  // Create notification (fire-and-forget)
  if (data && !error) {
    supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single()
      .then(({ data: post }) => {
        if (post && (post as any).user_id !== userId) {
          createNotification({
            type: 'comment',
            senderId: userId,
            recipientId: (post as any).user_id,
            postId,
            commentId: (data as any).id,
          });
        }
      });
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

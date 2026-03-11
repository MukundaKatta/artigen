import { supabase } from '@/lib/supabase';
import { createNotification } from '@/services/notification.service';

export async function likeComment(userId: string, commentId: string) {
  const { error } = await supabase
    .from('comment_likes')
    .insert({ user_id: userId, comment_id: commentId });

  // Background notification with proper error handling
  if (!error) {
    supabase
      .from('comments')
      .select('user_id, post_id')
      .eq('id', commentId)
      .single()
      .then(({ data: comment }) => {
        if (comment && comment.user_id !== userId) {
          createNotification({
            type: 'comment_like',
            senderId: userId,
            recipientId: comment.user_id,
            commentId,
            postId: comment.post_id,
          })
            .catch((err) => console.warn('Failed to create comment like notification:', err));
        }
      })
      .catch((err) => console.warn('Failed to fetch comment owner for notification:', err));
  }

  return { error };
}

export async function unlikeComment(userId: string, commentId: string) {
  const { error } = await supabase
    .from('comment_likes')
    .delete()
    .eq('user_id', userId)
    .eq('comment_id', commentId);
  return { error };
}

export async function checkLikedComments(userId: string, commentIds: string[]) {
  if (commentIds.length === 0) return new Set<string>();
  const { data } = await supabase
    .from('comment_likes')
    .select('comment_id')
    .eq('user_id', userId)
    .in('comment_id', commentIds);
  return new Set((data || []).map((d) => d.comment_id as string));
}

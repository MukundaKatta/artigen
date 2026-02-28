import { supabase } from '@/lib/supabase';
import { NOTIFICATIONS_PAGE_SIZE } from '@/lib/constants';
import type { Notification, NotificationWithSender } from '@/types/database';

export async function getNotifications(userId: string, page = 0) {
  const from = page * NOTIFICATIONS_PAGE_SIZE;
  const to = from + NOTIFICATIONS_PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('notifications')
    .select('*, sender:profiles!sender_id(*)')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: (data || []) as unknown as NotificationWithSender[], error };
}

export async function markAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  return { error };
}

export async function markAllAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', userId)
    .eq('is_read', false);
  return { error };
}

export async function createNotification(params: {
  type: Notification['notification_type'];
  senderId: string;
  recipientId: string;
  postId?: string;
  commentId?: string;
}) {
  // Don't notify yourself
  if (params.senderId === params.recipientId) return { error: null };

  const { error } = await supabase.from('notifications').insert({
    notification_type: params.type,
    sender_id: params.senderId,
    recipient_id: params.recipientId,
    post_id: params.postId || null,
    comment_id: params.commentId || null,
  });
  return { error };
}

import { useState, useEffect, useCallback } from 'react';
import { NOTIFICATIONS_PAGE_SIZE } from '@/lib/constants';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '@/services/notification.service';
import type { NotificationWithSender } from '@/types';

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<NotificationWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await getNotifications(userId, 0);
    setNotifications(data);
    setPage(0);
    setHasMore(data.length >= NOTIFICATIONS_PAGE_SIZE);
    setLoading(false);
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const { data } = await getNotifications(userId, 0);
    setNotifications(data);
    setPage(0);
    setHasMore(data.length >= NOTIFICATIONS_PAGE_SIZE);
  }, [userId]);

  const loadMore = useCallback(async () => {
    if (!userId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data } = await getNotifications(userId, nextPage);
    setNotifications((prev) => [...prev, ...data]);
    setPage(nextPage);
    setHasMore(data.length >= NOTIFICATIONS_PAGE_SIZE);
    setLoadingMore(false);
  }, [userId, page, loadingMore, hasMore]);

  const markRead = useCallback(async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    await markAsRead(notificationId);
  }, []);

  const markAll = useCallback(async () => {
    if (!userId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllAsRead(userId);
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    loadingMore,
    hasMore,
    refresh,
    loadMore,
    markRead,
    markAll,
  };
}

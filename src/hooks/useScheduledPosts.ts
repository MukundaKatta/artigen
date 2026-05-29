import { useState, useEffect, useCallback } from 'react';
import {
  getScheduledPosts,
  cancelSchedule,
  publishScheduledPost,
} from '@/services/schedule.service';
import { logger } from '@/lib/logger';

export function useScheduledPosts(userId: string | undefined) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await getScheduledPosts(userId);
      setPosts(data);
    } catch (err) {
      logger.warn('Failed to load scheduled posts:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const cancel = useCallback(async (postId: string) => {
    const { error } = await cancelSchedule(postId);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
    return { error };
  }, []);

  const publishNow = useCallback(async (postId: string) => {
    const { error } = await publishScheduledPost(postId);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
    return { error };
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    cancel,
    publishNow,
    refresh: fetchPosts,
  };
}

import { useState, useEffect, useCallback } from 'react';
import { getFollowedStories } from '@/services/story.service';
import type { UserStories } from '@/types';

export function useStories(userId: string | undefined) {
  const [stories, setStories] = useState<UserStories[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const { data } = await getFollowedStories(userId);
    setStories(data);
    setLoading(false);
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const { data } = await getFollowedStories(userId);
    setStories(data);
  }, [userId]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  return { stories, loading, refresh };
}

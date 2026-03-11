import { useState, useEffect, useCallback, useRef } from 'react';
import { checkIsFollowing, followUser, unfollowUser } from '@/services/follow.service';
import { logger } from '@/lib/logger';

export function useFollow(currentUserId: string | undefined, targetUserId: string) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const pending = useRef(false);

  useEffect(() => {
    if (!currentUserId || currentUserId === targetUserId) {
      setLoading(false);
      return;
    }

    checkIsFollowing(currentUserId, targetUserId).then(({ isFollowing }) => {
      setIsFollowing(isFollowing);
    }).catch((err) => {
      logger.warn('Failed to check follow status:', err);
    }).finally(() => setLoading(false));
  }, [currentUserId, targetUserId]);

  const toggleFollow = useCallback(async () => {
    if (!currentUserId || pending.current) return;

    pending.current = true;

    // Optimistic update
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);

    const { error } = wasFollowing
      ? await unfollowUser(currentUserId, targetUserId)
      : await followUser(currentUserId, targetUserId);

    pending.current = false;

    // Revert on error
    if (error) {
      setIsFollowing(wasFollowing);
    }
  }, [currentUserId, targetUserId, isFollowing]);

  return { isFollowing, loading, toggleFollow };
}

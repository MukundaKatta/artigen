import { useState, useEffect, useCallback } from 'react';
import { checkIsFollowing, followUser, unfollowUser } from '@/services/follow.service';

export function useFollow(currentUserId: string | undefined, targetUserId: string) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId || currentUserId === targetUserId) {
      setLoading(false);
      return;
    }

    checkIsFollowing(currentUserId, targetUserId).then(({ isFollowing }) => {
      setIsFollowing(isFollowing);
      setLoading(false);
    });
  }, [currentUserId, targetUserId]);

  const toggleFollow = useCallback(async () => {
    if (!currentUserId) return;

    // Optimistic update
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);

    const { error } = wasFollowing
      ? await unfollowUser(currentUserId, targetUserId)
      : await followUser(currentUserId, targetUserId);

    // Revert on error
    if (error) {
      setIsFollowing(wasFollowing);
    }
  }, [currentUserId, targetUserId, isFollowing]);

  return { isFollowing, loading, toggleFollow };
}

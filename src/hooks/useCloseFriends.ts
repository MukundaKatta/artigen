import { useState, useEffect, useCallback } from 'react';
import {
  getCloseFriends,
  addCloseFriend,
  removeCloseFriend,
} from '@/services/close-friends.service';
import type { Profile } from '@/types';

export function useCloseFriends(userId: string | undefined) {
  const [friends, setFriends] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());

  const fetchFriends = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await getCloseFriends(userId);
    setFriends(data);
    setFriendIds(new Set(data.map((f) => f.id)));
    setLoading(false);
  }, [userId]);

  const toggleFriend = useCallback(
    async (friendId: string) => {
      if (!userId) return;

      const wasFriend = friendIds.has(friendId);
      const previousFriends = friends;

      if (wasFriend) {
        // Optimistic update: remove
        setFriendIds((prev) => {
          const next = new Set(prev);
          next.delete(friendId);
          return next;
        });
        setFriends((prev) => prev.filter((f) => f.id !== friendId));

        try {
          await removeCloseFriend(userId, friendId);
        } catch {
          // Revert on error
          setFriendIds((prev) => new Set(prev).add(friendId));
          setFriends(previousFriends);
        }
      } else {
        // Optimistic update: add
        setFriendIds((prev) => new Set(prev).add(friendId));

        try {
          await addCloseFriend(userId, friendId);
          await fetchFriends(); // Refresh to get profile data
        } catch {
          // Revert on error
          setFriendIds((prev) => {
            const next = new Set(prev);
            next.delete(friendId);
            return next;
          });
          setFriends(previousFriends);
        }
      }
    },
    [userId, friendIds, friends, fetchFriends]
  );

  const isFriend = useCallback(
    (id: string) => friendIds.has(id),
    [friendIds]
  );

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return {
    friends,
    loading,
    friendIds,
    toggleFriend,
    isFriend,
    refresh: fetchFriends,
  };
}

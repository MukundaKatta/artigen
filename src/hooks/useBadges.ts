import { useState, useEffect, useCallback } from 'react';
import {
  getUserBadges,
  getAllBadges,
  checkAndAwardPostBadges,
} from '@/services/badge.service';
import type { UserBadgeWithDetails } from '@/services/badge.service';
import type { Badge } from '@/types';

export function useBadges(userId: string | undefined) {
  const [userBadges, setUserBadges] = useState<UserBadgeWithDetails[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [newlyEarned, setNewlyEarned] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBadges = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const [userResult, allResult] = await Promise.all([
      getUserBadges(userId),
      getAllBadges(),
    ]);

    setUserBadges(userResult.data);
    setAllBadges(allResult.data);
    setLoading(false);
  }, [userId]);

  const checkPostBadges = useCallback(async () => {
    if (!userId) return;
    const awarded = await checkAndAwardPostBadges(userId);
    if (awarded.length > 0) {
      setNewlyEarned(awarded[0]);
      await fetchBadges();
    }
  }, [userId, fetchBadges]);

  const clearNewlyEarned = useCallback(() => {
    setNewlyEarned(null);
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  return {
    userBadges,
    allBadges,
    newlyEarned,
    loading,
    checkPostBadges,
    clearNewlyEarned,
    refresh: fetchBadges,
  };
}

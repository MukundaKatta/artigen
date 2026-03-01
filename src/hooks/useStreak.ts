import { useState, useEffect, useCallback } from 'react';
import { getStreak } from '@/services/streak.service';
import type { UserStreak } from '@/types';

export function useStreak(userId: string | undefined) {
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await getStreak(userId);
    setStreak(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return { streak, loading, refetch: fetchStreak };
}

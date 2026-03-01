import { useState, useEffect, useCallback } from 'react';
import { getUserXp, getXpHistory } from '@/services/xp.service';
import type { UserXp, XpTransaction } from '@/services/xp.service';

export function useXp(userId: string | undefined) {
  const [xp, setXp] = useState<UserXp | null>(null);
  const [level, setLevel] = useState(1);
  const [xpToNext, setXpToNext] = useState(100);
  const [history, setHistory] = useState<XpTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchXp = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [xpRes, historyRes] = await Promise.all([
      getUserXp(userId),
      getXpHistory(userId),
    ]);

    if (xpRes.data) {
      setXp(xpRes.data);
      setLevel(xpRes.data.level);
      setXpToNext(xpRes.data.xp_to_next_level);
    }

    setHistory(historyRes.data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchXp();
  }, [fetchXp]);

  const refresh = useCallback(() => {
    fetchXp();
  }, [fetchXp]);

  return {
    xp,
    level,
    xpToNext,
    history,
    loading,
    refresh,
  };
}

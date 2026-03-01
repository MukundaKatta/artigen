import { useState, useEffect, useCallback } from 'react';
import {
  getActiveBattles,
  createBattle,
} from '@/services/battle.service';
import type { BattleWithUsers } from '@/services/battle.service';

const PAGE_SIZE = 20;

export function useBattles() {
  const [battles, setBattles] = useState<BattleWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // ── Fetch battles ─────────────────────────────────

  const fetchBattles = useCallback(async (pageNum = 0) => {
    if (pageNum === 0) setLoading(true);
    const { data } = await getActiveBattles(pageNum);

    if (pageNum === 0) {
      setBattles(data);
    } else {
      setBattles((prev) => [...prev, ...data]);
    }

    setPage(pageNum);
    setHasMore(data.length >= PAGE_SIZE);
    setLoading(false);
  }, []);

  // ── Refresh ───────────────────────────────────────

  const refresh = useCallback(() => {
    fetchBattles(0);
  }, [fetchBattles]);

  // ── Load more ─────────────────────────────────────

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    fetchBattles(page + 1);
  }, [hasMore, loading, page, fetchBattles]);

  // ── Create battle ─────────────────────────────────

  const create = useCallback(
    async (creatorId: string, theme: string, title: string, timeLimitMinutes?: number) => {
      const { data, error } = await createBattle(creatorId, theme, title, timeLimitMinutes);
      if (data) {
        // Refresh list to include the new battle
        refresh();
      }
      return { data, error };
    },
    [refresh],
  );

  // ── Auto-fetch on mount ───────────────────────────

  useEffect(() => {
    fetchBattles(0);
  }, [fetchBattles]);

  return {
    battles,
    loading,
    page,
    hasMore,
    refresh,
    loadMore,
    createBattle: create,
  };
}

import { useState, useEffect, useCallback } from 'react';
import {
  getLeaderboard,
  LeaderboardPeriod,
  LeaderboardEntry,
} from '@/services/leaderboard.service';

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');

  const fetchLeaderboard = useCallback(async (p: LeaderboardPeriod) => {
    setLoading(true);
    const { data } = await getLeaderboard(p);
    setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period, fetchLeaderboard]);

  const changePeriod = useCallback((p: LeaderboardPeriod) => {
    setPeriod(p);
  }, []);

  const refresh = useCallback(() => {
    fetchLeaderboard(period);
  }, [period, fetchLeaderboard]);

  return {
    entries,
    loading,
    period,
    changePeriod,
    refresh,
  };
}

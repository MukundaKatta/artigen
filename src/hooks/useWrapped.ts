import { useCallback, useEffect, useState } from 'react';
import { fetchWrappedStats, type WrappedStats } from '@/services/wrapped.service';
import { useAuth } from '@/providers/AuthProvider';

export function useWrapped(year?: number) {
  const { user } = useAuth();
  const targetYear = year || new Date().getFullYear();
  const [stats, setStats] = useState<WrappedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWrappedStats(user.id, targetYear);
      setStats(data);
    } catch (e) {
      setError('Failed to load your year in review');
    } finally {
      setLoading(false);
    }
  }, [user?.id, targetYear]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, refresh: loadStats };
}

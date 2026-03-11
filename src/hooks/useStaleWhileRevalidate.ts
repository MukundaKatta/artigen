import { useState, useEffect, useCallback, useRef } from 'react';
import { getCached, setCached, cacheKey } from '@/lib/api-cache';

type SWRState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  /** True when showing cached data while revalidating in the background. */
  isStale: boolean;
  refresh: () => Promise<void>;
};

type SWROptions = {
  /** Cache TTL in milliseconds (default: 5 minutes). */
  ttlMs?: number;
  /** Whether to fetch on mount (default: true). */
  enabled?: boolean;
};

/**
 * Stale-while-revalidate hook.
 *
 * 1. Returns cached data immediately (if available)
 * 2. Revalidates in the background
 * 3. Updates data when revalidation completes
 *
 * Usage:
 * ```ts
 * const { data, loading, isStale, refresh } = useStaleWhileRevalidate(
 *   ['feed', userId],
 *   () => postService.getFeed(userId, 1),
 * );
 * ```
 */
export function useStaleWhileRevalidate<T>(
  keyParts: (string | number | undefined)[],
  fetcher: () => Promise<{ data: T | null; error: any }>,
  options: SWROptions = {},
): SWRState<T> {
  const { ttlMs = 5 * 60 * 1000, enabled = true } = options;
  const key = cacheKey('swr', ...keyParts);

  const [data, setData] = useState<T | null>(() => getCached<T>(key) ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!data);
  const [isStale, setIsStale] = useState(!!data);
  const mountedRef = useRef(true);

  const revalidate = useCallback(async () => {
    const cached = getCached<T>(key);
    if (cached) {
      setData(cached);
      setIsStale(true);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const result = await fetcher();
      if (!mountedRef.current) return;

      if (result.error) {
        // Keep stale data on error, but set error state
        setError(typeof result.error === 'string' ? result.error : result.error.message ?? 'Unknown error');
      } else if (result.data !== null) {
        setCached(key, result.data, ttlMs);
        setData(result.data);
        setError(null);
      }
    } catch (e: any) {
      if (!mountedRef.current) return;
      setError(e.message ?? 'Network error');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsStale(false);
      }
    }
  }, [key, fetcher, ttlMs]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) {
      revalidate();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [enabled, revalidate]);

  return {
    data,
    error,
    loading,
    isStale,
    refresh: revalidate,
  };
}

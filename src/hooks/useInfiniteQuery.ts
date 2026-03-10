import { useState, useCallback, useRef, useEffect } from 'react';

type InfiniteQueryOptions<T> = {
  /** Function that fetches a page of data */
  fetcher: (page: number) => Promise<{ data: T[]; hasMore: boolean }>;
  /** Page size for determining if there are more pages */
  pageSize?: number;
  /** Whether to fetch the first page immediately */
  enabled?: boolean;
};

type InfiniteQueryResult<T> = {
  data: T[];
  isLoading: boolean;
  isRefreshing: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  fetchMore: () => void;
  refresh: () => void;
};

/**
 * Generic infinite scroll hook with proper loading states.
 *
 * Handles:
 * - Initial loading
 * - Pull-to-refresh
 * - Load more pagination
 * - Deduplication of concurrent requests
 * - Stale data prevention
 */
export function useInfiniteQuery<T>(options: InfiniteQueryOptions<T>): InfiniteQueryResult<T> {
  const { fetcher, enabled = true } = options;

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageRef = useRef(0);
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchPage = useCallback(
    async (page: number, mode: 'initial' | 'refresh' | 'more') => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      if (mode === 'initial') setIsLoading(true);
      else if (mode === 'refresh') setIsRefreshing(true);
      else setIsFetchingMore(true);

      try {
        const result = await fetcher(page);
        if (!mountedRef.current) return;

        if (mode === 'refresh' || mode === 'initial') {
          setData(result.data);
        } else {
          setData((prev) => [...prev, ...result.data]);
        }

        setHasMore(result.hasMore);
        setError(null);
        pageRef.current = page;
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
          setIsFetchingMore(false);
        }
        fetchingRef.current = false;
      }
    },
    [fetcher],
  );

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchPage(0, 'initial');
    }
  }, [enabled, fetchPage]);

  const fetchMore = useCallback(() => {
    if (!hasMore || fetchingRef.current) return;
    fetchPage(pageRef.current + 1, 'more');
  }, [hasMore, fetchPage]);

  const refresh = useCallback(() => {
    pageRef.current = 0;
    fetchPage(0, 'refresh');
  }, [fetchPage]);

  return {
    data,
    isLoading,
    isRefreshing,
    isFetchingMore,
    hasMore,
    error,
    fetchMore,
    refresh,
  };
}

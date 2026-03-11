import { useState, useCallback, useEffect, useRef } from 'react';
import { EXPLORE_PAGE_SIZE } from '@/lib/constants';
import * as trendingService from '@/services/trending.service';
import type { TrendingPost } from '@/services/trending.service';

export function useTrending() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const [promptRes, styleRes] = await Promise.all([
      trendingService.getTrendingPrompts(),
      trendingService.getTrendingStyles(),
    ]);
    setPrompts(promptRes.data || []);
    setStyles(styleRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { prompts, styles, loading, refresh: fetch };
}

/**
 * Hook for fetching trending posts with pagination, pull-to-refresh,
 * and infinite scroll support.
 */
export function useTrendingPosts(viewerId: string | undefined) {
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await trendingService.getTrendingPosts(
      0,
      EXPLORE_PAGE_SIZE,
      viewerId,
    );
    if (!isMounted.current) return;
    if (fetchError) {
      setError(fetchError.message ?? 'Failed to load trending posts');
    } else {
      setPosts(data);
      setHasMore(data.length >= EXPLORE_PAGE_SIZE);
    }
    setPage(0);
    setLoading(false);
  }, [viewerId]);

  const refresh = useCallback(async () => {
    if (!isMounted.current) return;
    setRefreshing(true);
    const { data, error: refreshError } = await trendingService.getTrendingPosts(
      0,
      EXPLORE_PAGE_SIZE,
      viewerId,
    );
    if (!isMounted.current) return;
    if (refreshError) {
      setError(refreshError.message ?? 'Failed to refresh trending');
    } else {
      setPosts(data);
      setPage(0);
      setHasMore(data.length >= EXPLORE_PAGE_SIZE);
      setError(null);
    }
    setRefreshing(false);
  }, [viewerId]);

  const loadMore = useCallback(async () => {
    if (!viewerId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data, error: loadError } = await trendingService.getTrendingPosts(
      nextPage,
      EXPLORE_PAGE_SIZE,
      viewerId,
    );
    if (!isMounted.current) return;
    if (!loadError) {
      setPosts((prev) => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length >= EXPLORE_PAGE_SIZE);
    }
    setLoadingMore(false);
  }, [viewerId, page, loadingMore, hasMore]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return {
    posts,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
  };
}

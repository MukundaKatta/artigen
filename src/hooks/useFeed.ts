import { useState, useEffect, useCallback } from 'react';
import { FEED_PAGE_SIZE } from '@/lib/constants';
import {
  getFeed,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
} from '@/services/post.service';
import type { FeedPost } from '@/types';

export function useFeed(userId: string | undefined) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getFeed(userId, 0);
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setPosts(data);
      setHasMore(data.length >= FEED_PAGE_SIZE);
    }
    setPage(0);
    setLoading(false);
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    const { data } = await getFeed(userId, 0);
    setPosts(data);
    setPage(0);
    setHasMore(data.length >= FEED_PAGE_SIZE);
    setRefreshing(false);
  }, [userId]);

  const loadMore = useCallback(async () => {
    if (!userId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data } = await getFeed(userId, nextPage);
    setPosts((prev) => [...prev, ...data]);
    setPage(nextPage);
    setHasMore(data.length >= FEED_PAGE_SIZE);
    setLoadingMore(false);
  }, [userId, page, loadingMore, hasMore]);

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!userId) return;

      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      const wasLiked = post.isLiked;

      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            isLiked: !wasLiked,
            likes_count: wasLiked ? p.likes_count - 1 : p.likes_count + 1,
          };
        })
      );

      const { error } = wasLiked
        ? await unlikePost(userId, postId)
        : await likePost(userId, postId);

      if (error) {
        // Revert
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              isLiked: wasLiked,
              likes_count: wasLiked ? p.likes_count + 1 : p.likes_count - 1,
            };
          })
        );
      }
    },
    [userId, posts]
  );

  const toggleSave = useCallback(
    async (postId: string) => {
      if (!userId) return;

      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      const wasSaved = post.isSaved;

      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return { ...p, isSaved: !wasSaved };
        })
      );

      const { error } = wasSaved
        ? await unsavePost(userId, postId)
        : await savePost(userId, postId);

      if (error) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return { ...p, isSaved: wasSaved };
          })
        );
      }
    },
    [userId, posts]
  );

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return {
    posts,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
    toggleLike,
    toggleSave,
  };
}

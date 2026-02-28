import { useState, useEffect, useCallback } from 'react';
import { EXPLORE_PAGE_SIZE } from '@/lib/constants';
import {
  getReels,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
} from '@/services/post.service';
import type { FeedPost } from '@/types';

export function useReels(userId: string | undefined) {
  const [reels, setReels] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchReels = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await getReels(userId, 0);
    setReels(data);
    setPage(0);
    setHasMore(data.length >= EXPLORE_PAGE_SIZE);
    setLoading(false);
  }, [userId]);

  const loadMore = useCallback(async () => {
    if (!userId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data } = await getReels(userId, nextPage);
    setReels((prev) => [...prev, ...data]);
    setPage(nextPage);
    setHasMore(data.length >= EXPLORE_PAGE_SIZE);
    setLoadingMore(false);
  }, [userId, page, loadingMore, hasMore]);

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!userId) return;
      const reel = reels.find((r) => r.id === postId);
      if (!reel) return;
      const wasLiked = reel.isLiked;

      setReels((prev) =>
        prev.map((r) => {
          if (r.id !== postId) return r;
          return {
            ...r,
            isLiked: !wasLiked,
            likes_count: wasLiked ? r.likes_count - 1 : r.likes_count + 1,
          };
        })
      );

      const { error } = wasLiked
        ? await unlikePost(userId, postId)
        : await likePost(userId, postId);

      if (error) {
        setReels((prev) =>
          prev.map((r) => {
            if (r.id !== postId) return r;
            return {
              ...r,
              isLiked: wasLiked,
              likes_count: wasLiked ? r.likes_count + 1 : r.likes_count - 1,
            };
          })
        );
      }
    },
    [userId, reels]
  );

  const toggleSave = useCallback(
    async (postId: string) => {
      if (!userId) return;
      const reel = reels.find((r) => r.id === postId);
      if (!reel) return;
      const wasSaved = reel.isSaved;

      setReels((prev) =>
        prev.map((r) => {
          if (r.id !== postId) return r;
          return { ...r, isSaved: !wasSaved };
        })
      );

      const { error } = wasSaved
        ? await unsavePost(userId, postId)
        : await savePost(userId, postId);

      if (error) {
        setReels((prev) =>
          prev.map((r) => {
            if (r.id !== postId) return r;
            return { ...r, isSaved: wasSaved };
          })
        );
      }
    },
    [userId, reels]
  );

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  return {
    reels,
    loading,
    loadingMore,
    hasMore,
    refresh: fetchReels,
    loadMore,
    toggleLike,
    toggleSave,
  };
}

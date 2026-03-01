import { useState, useEffect, useCallback } from 'react';
import { FEED_PAGE_SIZE } from '@/lib/constants';
import {
  getFeed,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
} from '@/services/post.service';
import { setReaction, removeReaction } from '@/services/post-reaction.service';
import { trackView } from '@/services/insights.service';
import { recordEngagement } from '@/services/taste-profile.service';
import type { FeedPost, ReactionType } from '@/types';

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
      } else if (!wasLiked) {
        // Fire-and-forget engagement tracking for new likes
        recordEngagement(userId, postId, 'like', post.ai_metadata?.style_tags || []).catch(() => {});
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
      } else if (!wasSaved) {
        // Fire-and-forget engagement tracking for new saves
        recordEngagement(userId, postId, 'save', post.ai_metadata?.style_tags || []).catch(() => {});
      }
    },
    [userId, posts]
  );

  const toggleReaction = useCallback(
    async (postId: string, reactionType: ReactionType) => {
      if (!userId) return;

      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      const hadReaction = post.userReaction;
      const isSameReaction = hadReaction === reactionType;

      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            isLiked: !isSameReaction,
            userReaction: isSameReaction ? null : reactionType,
            likes_count: isSameReaction
              ? p.likes_count - 1
              : hadReaction
                ? p.likes_count
                : p.likes_count + 1,
          };
        })
      );

      const { error } = isSameReaction
        ? await removeReaction(userId, postId)
        : await setReaction(userId, postId, reactionType);

      if (error) {
        // Revert optimistic update
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              isLiked: !!hadReaction,
              userReaction: hadReaction,
              likes_count: isSameReaction
                ? p.likes_count + 1
                : hadReaction
                  ? p.likes_count
                  : p.likes_count - 1,
            };
          })
        );
      }
    },
    [userId, posts]
  );

  // Track post views
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (!userId) return;
      for (const item of viewableItems) {
        if (item.isViewable && item.item?.id) {
          trackView(item.item.id, userId, 'feed');
        }
      }
    },
    [userId]
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
    toggleReaction,
    onViewableItemsChanged,
  };
}

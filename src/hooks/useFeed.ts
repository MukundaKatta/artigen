import { useState, useEffect, useCallback, useRef } from 'react';
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
  // Guards to prevent concurrent requests on the same post
  const pendingLikes = useRef(new Set<string>());
  const pendingSaves = useRef(new Set<string>());
  const pendingReactions = useRef(new Set<string>());
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
    const { data, error: refreshError } = await getFeed(userId, 0);
    if (refreshError) {
      setError(refreshError.message);
    } else {
      setPosts(data);
      setPage(0);
      setHasMore(data.length >= FEED_PAGE_SIZE);
      setError(null);
    }
    setRefreshing(false);
  }, [userId]);

  const loadMore = useCallback(async () => {
    if (!userId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data, error: loadError } = await getFeed(userId, nextPage);
    if (!loadError) {
      setPosts((prev) => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length >= FEED_PAGE_SIZE);
    }
    setLoadingMore(false);
  }, [userId, page, loadingMore, hasMore]);

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!userId || pendingLikes.current.has(postId)) return;

      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      const wasLiked = post.isLiked;

      pendingLikes.current.add(postId);

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

      pendingLikes.current.delete(postId);

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
        recordEngagement(userId, postId, 'like', post.ai_metadata?.style_tags || []).catch((err) => console.warn('Engagement tracking failed:', err));
      }
    },
    [userId, posts]
  );

  const toggleSave = useCallback(
    async (postId: string) => {
      if (!userId || pendingSaves.current.has(postId)) return;

      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      const wasSaved = post.isSaved;

      pendingSaves.current.add(postId);

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

      pendingSaves.current.delete(postId);

      if (error) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return { ...p, isSaved: wasSaved };
          })
        );
      } else if (!wasSaved) {
        // Fire-and-forget engagement tracking for new saves
        recordEngagement(userId, postId, 'save', post.ai_metadata?.style_tags || []).catch((err) => console.warn('Engagement tracking failed:', err));
      }
    },
    [userId, posts]
  );

  const toggleReaction = useCallback(
    async (postId: string, reactionType: ReactionType) => {
      if (!userId || pendingReactions.current.has(postId)) return;

      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      const hadReaction = post.userReaction;
      const isSameReaction = hadReaction === reactionType;

      pendingReactions.current.add(postId);

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

      pendingReactions.current.delete(postId);

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

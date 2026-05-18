import { useState, useEffect, useCallback, useRef } from 'react';
import type { ViewToken } from 'react-native';
import { FEED_PAGE_SIZE } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { getCached, setCached, cacheKey } from '@/lib/api-cache';
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

const FEED_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

/**
 * Primary feed hook for the home feed surface.
 *
 * Lifecycle:
 * 1. Hydrates `posts` synchronously from the in-memory cache (`getCached`) for
 *    instant render on tab return — stale-while-revalidate.
 * 2. Fires a fresh `getFeed` against Supabase, replaces `posts` on success,
 *    keeps stale data on failure (with `error` set).
 * 3. `loadMore` paginates `FEED_PAGE_SIZE` at a time; guarded by
 *    `loadingMoreRef` to prevent concurrent fetches when the user scrolls fast.
 * 4. `like`/`save`/`react` apply optimistic updates and revert on error. Each
 *    has a per-post pending Set so double-tapping doesn't fire duplicate
 *    requests.
 * 5. `onViewable` records views to insights and engagement to taste-profile.
 *
 * Differs from `useRealtimeFeed`: this hook does NOT subscribe to a Supabase
 * realtime channel — it's a pull-based feed for the main timeline. Use
 * `useRealtimeFeed` for surfaces that need live updates (e.g. trending now).
 *
 * Returns:
 * - `posts`, `loading`, `error`, `hasMore`
 * - `refresh()`, `loadMore()`
 * - `like(id)`, `save(id)`, `react(id, type)`, `unreact(id)`
 * - `onViewable(ids)` for FlatList viewability tracking
 */
export function useFeed(userId: string | undefined) {
  // Guards to prevent concurrent requests
  const loadingMoreRef = useRef(false);
  const pendingLikes = useRef(new Set<string>());
  const pendingSaves = useRef(new Set<string>());
  const pendingReactions = useRef(new Set<string>());

  // Initialize from cache for instant display (stale-while-revalidate)
  const feedCacheKey = userId ? cacheKey('feed', userId) : '';
  const cachedPosts = userId ? getCached<FeedPost[]>(feedCacheKey) : undefined;

  const [posts, setPosts] = useState<FeedPost[]>(cachedPosts ?? []);
  const [loading, setLoading] = useState(!cachedPosts);
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
    // Only show loading spinner if no cached data
    if (!getCached<FeedPost[]>(cacheKey('feed', userId))) {
      setLoading(true);
    }
    setError(null);
    const { data, error: fetchError } = await getFeed(userId, 0);
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setPosts(data);
      setHasMore(data.length >= FEED_PAGE_SIZE);
      // Cache first page for instant display on next visit
      setCached(cacheKey('feed', userId), data, FEED_CACHE_TTL);
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
      setCached(cacheKey('feed', userId), data, FEED_CACHE_TTL);
    }
    setRefreshing(false);
  }, [userId]);

  const loadMore = useCallback(async () => {
    if (!userId || loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data, error: loadError } = await getFeed(userId, nextPage);
    if (!loadError) {
      // Deduplicate: only add posts not already in the list
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newPosts = data.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });
      setPage(nextPage);
      setHasMore(data.length >= FEED_PAGE_SIZE);
    }
    setLoadingMore(false);
    loadingMoreRef.current = false;
  }, [userId, page, hasMore]);

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
        recordEngagement(userId, postId, 'like', post.ai_metadata?.style_tags || []).catch((err) => logger.warn('Engagement tracking failed:', err));
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
        recordEngagement(userId, postId, 'save', post.ai_metadata?.style_tags || []).catch((err) => logger.warn('Engagement tracking failed:', err));
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
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
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

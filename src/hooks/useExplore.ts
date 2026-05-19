import { useState, useEffect, useCallback, useRef } from 'react';
import { EXPLORE_PAGE_SIZE } from '@/lib/constants';
import { logger } from '@/lib/logger';
import {
  getExploreFeed,
  searchPosts,
  searchHashtags,
  searchByPrompt,
  searchByModel,
} from '@/services/explore.service';
import { searchUsers } from '@/services/profile.service';
import type { PostWithUser, Profile } from '@/types';
import { AI_MODELS } from '@/services/ai.service';

type Hashtag = { id: string; name: string; post_count: number };

export function useExplore() {
  const [query, setQuery] = useState('');
  const [explorePosts, setExplorePosts] = useState<PostWithUser[]>([]);
  const [searchResultPosts, setSearchResultPosts] = useState<PostWithUser[]>([]);
  const [searchResultUsers, setSearchResultUsers] = useState<
    Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url' | 'is_verified'>[]
  >([]);
  const [searchResultHashtags, setSearchResultHashtags] = useState<Hashtag[]>([]);
  const [searchResultPrompts, setSearchResultPrompts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [aiOnly, setAiOnly] = useState(false);
  const loadingMoreRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const isSearching = query.trim().length > 0;

  // Load explore feed
  const fetchExplore = useCallback(
    async (filterAiOnly?: boolean) => {
      const useAiOnly = filterAiOnly ?? aiOnly;
      setLoading(true);
      const { data } = await getExploreFeed(0, useAiOnly);
      setExplorePosts(data);
      setPage(0);
      setHasMore(data.length >= EXPLORE_PAGE_SIZE);
      setLoading(false);
    },
    [aiOnly],
  );

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || isSearching) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data } = await getExploreFeed(nextPage, aiOnly);
    // Deduplicate: only add posts not already in the list
    setExplorePosts((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newPosts = data.filter((p) => !existingIds.has(p.id));
      return [...prev, ...newPosts];
    });
    setPage(nextPage);
    setHasMore(data.length >= EXPLORE_PAGE_SIZE);
    setLoadingMore(false);
    loadingMoreRef.current = false;
  }, [page, hasMore, isSearching, aiOnly]);

  const toggleAiOnly = useCallback(() => {
    const newValue = !aiOnly;
    setAiOnly(newValue);
    fetchExplore(newValue);
  }, [aiOnly, fetchExplore]);

  // Search with debounce
  const search = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      setSearchResultUsers([]);
      setSearchResultPosts([]);
      setSearchResultHashtags([]);
      setSearchResultPrompts([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const [usersResult, postsResult, hashtagsResult, promptsResult] = await Promise.all([
          searchUsers(text.trim()),
          searchPosts(text.trim()),
          searchHashtags(text.trim()),
          searchByPrompt(text.trim()),
        ]);

        setSearchResultUsers(usersResult.data || []);
        setSearchResultPosts(postsResult.data || []);
        setSearchResultHashtags((hashtagsResult.data || []) as Hashtag[]);
        setSearchResultPrompts(promptsResult.data || []);
      } catch (err) {
        logger.warn('Search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setSearchResultUsers([]);
    setSearchResultPosts([]);
    setSearchResultHashtags([]);
    setSearchResultPrompts([]);
    setSearching(false);
  }, []);

  useEffect(() => {
    fetchExplore();
  }, [fetchExplore]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    query,
    isSearching,
    explorePosts,
    searchResultUsers,
    searchResultPosts,
    searchResultHashtags,
    searchResultPrompts,
    loading,
    searching,
    loadingMore,
    hasMore,
    aiOnly,
    aiModels: AI_MODELS,
    search,
    clearSearch,
    loadMore,
    toggleAiOnly,
    refresh: fetchExplore,
  };
}

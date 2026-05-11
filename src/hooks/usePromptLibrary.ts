import { useState, useEffect, useCallback } from 'react';
import {
  getPublicPrompts,
  searchPrompts,
  savePrompt,
  unsavePrompt,
  getSavedPrompts,
} from '@/services/prompt-library.service';
import type { PromptLibraryItem, PromptSave } from '@/types';

type PromptWithUser = PromptLibraryItem & {
  user: { id: string; username: string; avatar_url: string | null };
};

type SavedPromptWithJoin = PromptSave & {
  prompt?: PromptWithUser | null;
};

function isPromptId(value: string | undefined): value is string {
  return Boolean(value);
}

export function usePromptLibrary(userId: string | undefined) {
  const [prompts, setPrompts] = useState<PromptWithUser[]>([]);
  const [savedPromptIds, setSavedPromptIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPrompts = useCallback(async (pageNum: number, query: string) => {
    const { data } = query
      ? await searchPrompts(query, pageNum)
      : await getPublicPrompts(pageNum);

    if (pageNum === 0) {
      setPrompts(data as unknown as PromptWithUser[]);
    } else {
      setPrompts((prev) => [...prev, ...(data as unknown as PromptWithUser[])]);
    }
    setHasMore(data.length === 20);
    setLoading(false);
  }, []);

  useEffect(() => {
    setPage(0);
    setLoading(true);
    fetchPrompts(0, searchQuery);
  }, [searchQuery, fetchPrompts]);

  useEffect(() => {
    if (!userId) return;
    getSavedPrompts(userId).then(({ data }) => {
      const savedPrompts = data as unknown as SavedPromptWithJoin[];
      const ids = new Set(savedPrompts.map((saved) => saved.prompt_id || saved.prompt?.id).filter(isPromptId));
      setSavedPromptIds(ids);
    });
  }, [userId]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchPrompts(next, searchQuery);
  }, [page, hasMore, loading, searchQuery, fetchPrompts]);

  const refresh = useCallback(() => {
    setPage(0);
    setLoading(true);
    fetchPrompts(0, searchQuery);
  }, [fetchPrompts, searchQuery]);

  const toggleSave = useCallback(async (promptId: string) => {
    if (!userId) return;
    const isSaved = savedPromptIds.has(promptId);

    // Optimistic update
    setSavedPromptIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(promptId);
      else next.add(promptId);
      return next;
    });

    try {
      if (isSaved) {
        await unsavePrompt(userId, promptId);
      } else {
        await savePrompt(userId, promptId);
      }
    } catch {
      // Revert optimistic update on error
      setSavedPromptIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(promptId);
        else next.delete(promptId);
        return next;
      });
    }
  }, [userId, savedPromptIds]);

  return {
    prompts,
    loading,
    hasMore,
    searchQuery,
    setSearchQuery,
    loadMore,
    refresh,
    savedPromptIds,
    toggleSave,
  };
}

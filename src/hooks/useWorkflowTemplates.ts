import { useState, useEffect, useCallback } from 'react';
import {
  getPublicTemplates,
  getMyTemplates,
  saveTemplate,
  unsaveTemplate,
  getUserSavedTemplateIds,
} from '@/services/workflow.service';
import type { WorkflowTemplateWithUser } from '@/services/workflow.service';

const PAGE_SIZE = 20;

export function useWorkflowTemplates(userId: string | undefined) {
  const [templates, setTemplates] = useState<WorkflowTemplateWithUser[]>([]);
  const [myTemplates, setMyTemplates] = useState<WorkflowTemplateWithUser[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Fetch public templates ────────────────────────

  const fetchTemplates = useCallback(async (pageNum = 0) => {
    if (pageNum === 0) setLoading(true);
    const { data } = await getPublicTemplates(pageNum);

    if (pageNum === 0) {
      setTemplates(data);
    } else {
      setTemplates((prev) => [...prev, ...data]);
    }

    setPage(pageNum);
    setHasMore(data.length >= PAGE_SIZE);

    // Fetch saved status
    if (userId && data.length > 0) {
      const ids = data.map((t) => t.id);
      const saved = await getUserSavedTemplateIds(ids, userId);
      if (pageNum === 0) {
        setSavedIds(saved);
      } else {
        setSavedIds((prev) => {
          const merged = new Set(prev);
          saved.forEach((id) => merged.add(id));
          return merged;
        });
      }
    }

    setLoading(false);
  }, [userId]);

  // ── Fetch my templates ────────────────────────────

  const fetchMyTemplates = useCallback(async () => {
    if (!userId) return;
    const { data } = await getMyTemplates(userId);
    setMyTemplates(data);
  }, [userId]);

  // ── Refresh ───────────────────────────────────────

  const refresh = useCallback(() => {
    fetchTemplates(0);
    fetchMyTemplates();
  }, [fetchTemplates, fetchMyTemplates]);

  // ── Load more ─────────────────────────────────────

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    fetchTemplates(page + 1);
  }, [hasMore, loading, page, fetchTemplates]);

  // ── Search (client-side filter) ───────────────────

  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const filteredTemplates = searchQuery
    ? templates.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : templates;

  // ── Toggle save ───────────────────────────────────

  const toggleSave = useCallback(
    async (templateId: string) => {
      if (!userId) return;

      const isSaved = savedIds.has(templateId);

      // Optimistic update
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.delete(templateId);
        else next.add(templateId);
        return next;
      });

      setTemplates((prev) =>
        prev.map((t) =>
          t.id === templateId
            ? { ...t, save_count: t.save_count + (isSaved ? -1 : 1) }
            : t,
        ),
      );

      try {
        if (isSaved) {
          await unsaveTemplate(userId, templateId);
        } else {
          await saveTemplate(userId, templateId);
        }
      } catch {
        // Revert on error
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (isSaved) next.add(templateId);
          else next.delete(templateId);
          return next;
        });

        setTemplates((prev) =>
          prev.map((t) =>
            t.id === templateId
              ? { ...t, save_count: t.save_count + (isSaved ? 1 : -1) }
              : t,
          ),
        );
      }
    },
    [userId, savedIds],
  );

  // ── Auto-fetch on mount ───────────────────────────

  useEffect(() => {
    fetchTemplates(0);
    fetchMyTemplates();
  }, [fetchTemplates, fetchMyTemplates]);

  return {
    templates: filteredTemplates,
    myTemplates,
    savedIds,
    loading,
    hasMore,
    refresh,
    loadMore,
    search,
    searchQuery,
    toggleSave,
  };
}

import { useState, useCallback, useEffect } from 'react';
import * as critiqueService from '@/services/critique.service';
import type { Critique, CritiqueSummary, CritiqueRatings } from '@/services/critique.service';

const PAGE_SIZE = 20;

export function useCritique(postId: string | undefined, userId: string | undefined) {
  const [critiques, setCritiques] = useState<Critique[]>([]);
  const [summary, setSummary] = useState<CritiqueSummary | null>(null);
  const [userCritique, setUserCritique] = useState<Critique | null>(null);
  const [helpfulVotes, setHelpfulVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [togglingHelpful, setTogglingHelpful] = useState<string | null>(null);

  // ── Fetch critiques for the post ───────────────────

  const fetchCritiques = useCallback(
    async (pageNum = 0) => {
      if (!postId) return;
      if (pageNum === 0) setLoading(true);

      const { data } = await critiqueService.getCritiques(postId, pageNum);

      if (pageNum === 0) {
        setCritiques(data);
      } else {
        setCritiques((prev) => [...prev, ...data]);
      }

      setPage(pageNum);
      setHasMore(data.length >= PAGE_SIZE);

      // Fetch which critiques the current user voted helpful
      if (userId && data.length > 0) {
        const ids = data.map((c) => c.id);
        const voted = await critiqueService.getUserHelpfulVoteIds(ids, userId);
        if (pageNum === 0) {
          setHelpfulVotes(voted);
        } else {
          setHelpfulVotes((prev) => {
            const merged = new Set(prev);
            voted.forEach((id) => merged.add(id));
            return merged;
          });
        }
      }

      setLoading(false);
    },
    [postId, userId],
  );

  // ── Fetch summary ─────────────────────────────────

  const fetchSummary = useCallback(async () => {
    if (!postId) return;
    const { data } = await critiqueService.getPostCritiqueSummary(postId);
    setSummary(data);
  }, [postId]);

  // ── Fetch the current user's critique ──────────────

  const fetchUserCritique = useCallback(async () => {
    if (!postId || !userId) return;
    const { data } = await critiqueService.getUserCritiqueForPost(postId, userId);
    setUserCritique(data);
  }, [postId, userId]);

  // ── Load more critiques ────────────────────────────

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    fetchCritiques(page + 1);
  }, [hasMore, loading, page, fetchCritiques]);

  // ── Submit a critique ──────────────────────────────

  const submit = useCallback(
    async (ratings: CritiqueRatings, feedbackText: string) => {
      if (!postId || !userId) return { error: 'Missing postId or userId' };
      setSubmitting(true);

      const { data, error } = await critiqueService.submitCritique(postId, userId, ratings, feedbackText);

      if (data) {
        setCritiques((prev) => [data, ...prev]);
        setUserCritique(data);
        // Refresh summary to include new critique
        fetchSummary();
      }

      setSubmitting(false);
      return { data, error };
    },
    [postId, userId, fetchSummary],
  );

  // ── Toggle helpful vote (optimistic) ───────────────

  const toggleHelpful = useCallback(
    async (critiqueId: string) => {
      if (!userId || togglingHelpful) return;

      const isHelpful = helpfulVotes.has(critiqueId);
      setTogglingHelpful(critiqueId);

      // Optimistic update
      setHelpfulVotes((prev) => {
        const next = new Set(prev);
        if (isHelpful) next.delete(critiqueId);
        else next.add(critiqueId);
        return next;
      });

      setCritiques((prev) =>
        prev.map((c) =>
          c.id === critiqueId
            ? { ...c, helpful_count: c.helpful_count + (isHelpful ? -1 : 1) }
            : c,
        ),
      );

      try {
        if (isHelpful) {
          await critiqueService.unmarkHelpful(critiqueId, userId);
        } else {
          await critiqueService.markHelpful(critiqueId, userId);
        }
      } catch {
        // Revert optimistic update on error
        setHelpfulVotes((prev) => {
          const next = new Set(prev);
          if (isHelpful) next.add(critiqueId);
          else next.delete(critiqueId);
          return next;
        });

        setCritiques((prev) =>
          prev.map((c) =>
            c.id === critiqueId
              ? { ...c, helpful_count: c.helpful_count + (isHelpful ? 1 : -1) }
              : c,
          ),
        );
      } finally {
        setTogglingHelpful(null);
      }
    },
    [userId, helpfulVotes, togglingHelpful],
  );

  // ── Refresh all data ───────────────────────────────

  const refresh = useCallback(() => {
    fetchCritiques(0);
    fetchSummary();
    fetchUserCritique();
  }, [fetchCritiques, fetchSummary, fetchUserCritique]);

  // ── Auto-fetch on mount ────────────────────────────

  useEffect(() => {
    if (postId) {
      fetchCritiques(0);
      fetchSummary();
      fetchUserCritique();
    }
  }, [postId, fetchCritiques, fetchSummary, fetchUserCritique]);

  return {
    critiques,
    summary,
    userCritique,
    helpfulVotes,
    loading,
    submitting,
    hasMore,
    submit,
    toggleHelpful,
    loadMore,
    refresh,
    togglingHelpful,
  };
}

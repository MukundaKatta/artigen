import { useState, useEffect, useCallback } from 'react';
import {
  getTodayChallenge,
  getChallengeEntries,
  voteEntry,
  unvoteEntry,
  getUserVotedEntryIds,
} from '@/services/challenge.service';
import type { DailyChallenge } from '@/types';
import type { ChallengeEntryWithDetails } from '@/services/challenge.service';

const PAGE_SIZE = 20;

export function useChallenge(userId: string | undefined) {
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge | null>(null);
  const [entries, setEntries] = useState<ChallengeEntryWithDetails[]>([]);
  const [votedEntryIds, setVotedEntryIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [votingEntryId, setVotingEntryId] = useState<string | null>(null);

  // ── Fetch today's challenge ────────────────────────

  const fetchToday = useCallback(async () => {
    setLoading(true);
    const { data } = await getTodayChallenge();
    setTodayChallenge(data);
    setLoading(false);
  }, []);

  // ── Fetch entries for a challenge ──────────────────

  const fetchEntries = useCallback(
    async (challengeId: string, pageNum = 0) => {
      if (pageNum === 0) setLoadingEntries(true);
      const { data } = await getChallengeEntries(challengeId, pageNum);

      if (pageNum === 0) {
        setEntries(data);
      } else {
        setEntries((prev) => [...prev, ...data]);
      }

      setPage(pageNum);
      setHasMore(data.length >= PAGE_SIZE);

      // Fetch which entries the current user voted for
      if (userId && data.length > 0) {
        const ids = data.map((e) => e.id);
        const voted = await getUserVotedEntryIds(ids, userId);
        if (pageNum === 0) {
          setVotedEntryIds(voted);
        } else {
          setVotedEntryIds((prev) => {
            const merged = new Set(prev);
            voted.forEach((id) => merged.add(id));
            return merged;
          });
        }
      }

      setLoadingEntries(false);
    },
    [userId],
  );

  // ── Load more entries ──────────────────────────────

  const loadMoreEntries = useCallback(
    (challengeId: string) => {
      if (!hasMore || loadingEntries) return;
      fetchEntries(challengeId, page + 1);
    },
    [hasMore, loadingEntries, page, fetchEntries],
  );

  // ── Vote / Unvote ─────────────────────────────────

  const toggleVote = useCallback(
    async (entryId: string) => {
      if (!userId || votingEntryId) return;

      const isVoted = votedEntryIds.has(entryId);
      setVotingEntryId(entryId);

      // Optimistic update
      setVotedEntryIds((prev) => {
        const next = new Set(prev);
        if (isVoted) next.delete(entryId);
        else next.add(entryId);
        return next;
      });

      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? { ...e, vote_count: e.vote_count + (isVoted ? -1 : 1) }
            : e,
        ),
      );

      try {
        if (isVoted) {
          await unvoteEntry(entryId, userId);
        } else {
          await voteEntry(entryId, userId);
        }
      } catch {
        // Revert optimistic update on error
        setVotedEntryIds((prev) => {
          const next = new Set(prev);
          if (isVoted) next.add(entryId);
          else next.delete(entryId);
          return next;
        });

        setEntries((prev) =>
          prev.map((e) =>
            e.id === entryId
              ? { ...e, vote_count: e.vote_count + (isVoted ? 1 : -1) }
              : e,
          ),
        );
      } finally {
        setVotingEntryId(null);
      }
    },
    [userId, votedEntryIds, votingEntryId],
  );

  // ── Auto-fetch on mount ────────────────────────────

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  useEffect(() => {
    if (todayChallenge) {
      fetchEntries(todayChallenge.id, 0);
    }
  }, [todayChallenge, fetchEntries]);

  return {
    todayChallenge,
    entries,
    votedEntryIds,
    loading,
    loadingEntries,
    hasMore,
    fetchToday,
    fetchEntries,
    loadMoreEntries,
    toggleVote,
    votingEntryId,
  };
}

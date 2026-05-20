import { useState, useEffect, useCallback } from 'react';
import {
  getActiveWeeklyEvent,
  getWeeklyEntries,
  submitWeeklyEntry,
  voteWeeklyEntry,
  unvoteWeeklyEntry,
  getUserVotedWeeklyEntryIds,
} from '@/services/weekly-event.service';
import type {
  WeeklyEvent,
  WeeklyEventEntryWithDetails,
} from '@/services/weekly-event.service';
import { logger } from '@/lib/logger';

export function useWeeklyEvent(userId: string | undefined) {
  const [event, setEvent] = useState<WeeklyEvent | null>(null);
  const [entries, setEntries] = useState<WeeklyEventEntryWithDetails[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [votingEntryId, setVotingEntryId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const { data: activeEvent } = await getActiveWeeklyEvent();
      setEvent(activeEvent);

      if (activeEvent) {
        const { data: eventEntries } = await getWeeklyEntries(activeEvent.id);
        setEntries(eventEntries);

        // Fetch user votes
        if (userId && eventEntries.length > 0) {
          const entryIds = eventEntries.map((e) => e.id);
          const voted = await getUserVotedWeeklyEntryIds(entryIds, userId);
          setUserVotes(voted);
        }
      }
    } catch (err) {
      logger.warn('useWeeklyEvent: failed to load data', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const submit = useCallback(
    async (postId: string) => {
      if (!event || !userId) return { error: new Error('Missing params') };

      const { data, error } = await submitWeeklyEntry(event.id, userId, postId);
      if (data && !error) {
        setEntries((prev) => [data, ...prev]);
      }
      return { data, error };
    },
    [event, userId],
  );

  const vote = useCallback(
    async (entryId: string) => {
      if (!userId || votingEntryId) return;

      const isVoted = userVotes.has(entryId);
      setVotingEntryId(entryId);

      // Optimistic update
      setUserVotes((prev) => {
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
          await unvoteWeeklyEntry(entryId, userId);
        } else {
          await voteWeeklyEntry(entryId, userId);
        }
      } catch {
        // Revert optimistic update on error
        setUserVotes((prev) => {
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
    [userId, userVotes, votingEntryId],
  );

  return {
    event,
    entries,
    userVotes,
    loading,
    votingEntryId,
    submit,
    vote,
    refresh: fetchData,
  };
}

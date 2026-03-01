import { useState, useCallback } from 'react';
import { getPollForPost, votePoll } from '@/services/poll.service';

export type PollState = {
  question: string;
  options: { id: string; text: string; vote_count: number }[];
  userVoteOptionId?: string;
  ends_at?: string;
};

export function usePolls(userId: string | undefined) {
  const [polls, setPolls] = useState<Map<string, PollState>>(new Map());
  const [loading, setLoading] = useState(false);

  /**
   * Load the poll for a given post, if it exists.
   */
  const loadPoll = useCallback(
    async (postId: string) => {
      if (!userId) return null;
      setLoading(true);
      const { data } = await getPollForPost(postId, userId);
      if (data) {
        setPolls((prev) => {
          const next = new Map(prev);
          next.set(postId, data);
          return next;
        });
      }
      setLoading(false);
      return data;
    },
    [userId]
  );

  /**
   * Cast a vote. Optimistically updates the local state, then syncs with the server.
   */
  const vote = useCallback(
    async (postId: string, pollId: string, optionId: string) => {
      if (!userId) return;

      const current = polls.get(postId);
      if (!current) return;

      // Don't allow voting twice
      if (current.userVoteOptionId) return;

      // Optimistic update
      setPolls((prev) => {
        const next = new Map(prev);
        const poll = next.get(postId);
        if (!poll) return prev;
        next.set(postId, {
          ...poll,
          userVoteOptionId: optionId,
          options: poll.options.map((o) =>
            o.id === optionId ? { ...o, vote_count: o.vote_count + 1 } : o
          ),
        });
        return next;
      });

      const { error } = await votePoll(pollId, optionId, userId);

      if (error) {
        // Revert on error
        setPolls((prev) => {
          const next = new Map(prev);
          next.set(postId, current);
          return next;
        });
      }
    },
    [userId, polls]
  );

  /**
   * Get the poll data for a specific post (from local cache).
   */
  const getPoll = useCallback(
    (postId: string) => polls.get(postId) ?? null,
    [polls]
  );

  return {
    polls,
    loading,
    loadPoll,
    vote,
    getPoll,
  };
}

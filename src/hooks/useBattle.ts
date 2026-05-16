import { useState, useEffect, useCallback } from 'react';
import {
  getBattle,
  getBattleEntries,
  getUserBattleVote,
  joinBattle,
  submitEntry,
  voteBattleEntry,
  unvoteBattleEntry,
} from '@/services/battle.service';
import type {
  BattleWithUsers,
  BattleEntryWithUser,
  BattleVote,
} from '@/services/battle.service';

export function useBattle(battleId: string | undefined, userId: string | undefined) {
  const [battle, setBattle] = useState<BattleWithUsers | null>(null);
  const [entries, setEntries] = useState<BattleEntryWithUser[]>([]);
  const [userVote, setUserVote] = useState<BattleVote | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  // ── Fetch battle + entries ────────────────────────

  const refresh = useCallback(async () => {
    if (!battleId) return;
    setLoading(true);

    const [battleRes, entriesRes] = await Promise.all([
      getBattle(battleId),
      getBattleEntries(battleId),
    ]);

    setBattle(battleRes.data);
    setEntries(entriesRes.data);

    if (userId) {
      const { data: vote } = await getUserBattleVote(battleId, userId);
      setUserVote(vote);
    }

    setLoading(false);
  }, [battleId, userId]);

  // ── Join a battle ─────────────────────────────────

  const join = useCallback(async () => {
    if (!battleId || !userId) return;
    const { data, error } = await joinBattle(battleId, userId);
    if (data) {
      const joinedBattle: Partial<BattleWithUsers> = { ...data, opponent: null };
      setBattle((prev) => prev ? { ...prev, ...joinedBattle } : null);
    }
    return { data, error };
  }, [battleId, userId]);

  // ── Submit an entry ───────────────────────────────

  const submitBattleEntry = useCallback(
    async (imageUrl: string, promptUsed: string, postId?: string) => {
      if (!battleId || !userId) return;
      const { data, error } = await submitEntry(battleId, userId, imageUrl, promptUsed, postId);
      if (data) {
        // Refresh entries to get the full data with user join
        const { data: updated } = await getBattleEntries(battleId);
        setEntries(updated);
      }
      return { data, error };
    },
    [battleId, userId],
  );

  // ── Vote / Unvote (optimistic) ────────────────────

  const vote = useCallback(
    async (entryId: string) => {
      if (!battleId || !userId || voting) return;

      const isAlreadyVoted = userVote !== null;
      const previousVote = userVote;
      const previousEntries = [...entries];

      setVoting(true);

      if (isAlreadyVoted && userVote?.entry_id === entryId) {
        // Unvote — same entry
        setUserVote(null);
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entryId
              ? { ...e, vote_count: Math.max(0, e.vote_count - 1) }
              : e,
          ),
        );

        try {
          await unvoteBattleEntry(battleId, userId);
        } catch {
          setUserVote(previousVote);
          setEntries(previousEntries);
        }
      } else {
        // Vote for entry (remove previous if exists)
        if (isAlreadyVoted) {
          // Unvote previous first
          setEntries((prev) =>
            prev.map((e) => {
              if (e.id === previousVote?.entry_id) return { ...e, vote_count: Math.max(0, e.vote_count - 1) };
              if (e.id === entryId) return { ...e, vote_count: e.vote_count + 1 };
              return e;
            }),
          );
          setUserVote({ battle_id: battleId, entry_id: entryId, user_id: userId, id: '', created_at: '' });

          try {
            await unvoteBattleEntry(battleId, userId);
            await voteBattleEntry(battleId, entryId, userId);
            const { data: newVote } = await getUserBattleVote(battleId, userId);
            setUserVote(newVote);
          } catch {
            setUserVote(previousVote);
            setEntries(previousEntries);
          }
        } else {
          // Fresh vote
          setUserVote({ battle_id: battleId, entry_id: entryId, user_id: userId, id: '', created_at: '' });
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entryId
                ? { ...e, vote_count: e.vote_count + 1 }
                : e,
            ),
          );

          try {
            await voteBattleEntry(battleId, entryId, userId);
            const { data: newVote } = await getUserBattleVote(battleId, userId);
            setUserVote(newVote);
          } catch {
            setUserVote(previousVote);
            setEntries(previousEntries);
          }
        }
      }

      setVoting(false);
    },
    [battleId, userId, voting, userVote, entries],
  );

  // ── Auto-fetch on mount ───────────────────────────

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    battle,
    entries,
    userVote,
    loading,
    voting,
    join,
    submitEntry: submitBattleEntry,
    vote,
    refresh,
  };
}

/**
 * battle.service — data layer for the Art Battles feature.
 *
 * Lifecycle of an `ArtBattle`:
 *   waiting → active → voting → completed
 *
 * State transitions are driven by:
 * - `createBattle` writes a `waiting` battle
 * - opponent acceptance / join flips it to `active`
 * - server-side cron (or `time_limit_minutes` expiry) flips `active` → `voting`
 * - `voting_ends_at` expiry flips `voting` → `completed` and sets `winner_id`
 *
 * Vote tallying happens via DB triggers on `battle_votes` insert/delete —
 * `vote_count` on `BattleEntry` is denormalized for read perf.
 *
 * Every exported function returns `{ data, error }` (Supabase shape).
 * Mocked in tests via `src/__mocks__/lib/supabase.ts`.
 */

import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 20;

// ── Types ────────────────────────────────────────────

export type ArtBattle = {
  id: string;
  title: string;
  theme: string;
  description: string | null;
  status: 'waiting' | 'active' | 'voting' | 'completed';
  creator_id: string;
  opponent_id: string | null;
  winner_id: string | null;
  time_limit_minutes: number;
  voting_ends_at: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

export type BattleEntry = {
  id: string;
  battle_id: string;
  user_id: string;
  post_id: string | null;
  image_url: string | null;
  prompt_used: string | null;
  vote_count: number;
  submitted_at: string;
};

export type BattleVote = {
  id: string;
  battle_id: string;
  entry_id: string;
  user_id: string;
  created_at: string;
};

export type BattleWithUsers = ArtBattle & {
  creator: { id: string; username: string; avatar_url: string | null };
  opponent: { id: string; username: string; avatar_url: string | null } | null;
  winner: { id: string; username: string; avatar_url: string | null } | null;
};

export type BattleEntryWithUser = BattleEntry & {
  user: { id: string; username: string; avatar_url: string | null };
};

// ── Create a battle ──────────────────────────────────

export async function createBattle(
  creatorId: string,
  theme: string,
  title: string,
  timeLimitMinutes = 15,
) {
  const { data, error } = await supabase
    .from('art_battles')
    .insert({
      creator_id: creatorId,
      theme,
      title,
      time_limit_minutes: timeLimitMinutes,
      status: 'waiting',
    })
    .select()
    .single();

  return { data: data as unknown as ArtBattle | null, error };
}

// ── Join a battle ────────────────────────────────────

export async function joinBattle(battleId: string, userId: string) {
  const { data, error } = await supabase
    .from('art_battles')
    .update({
      opponent_id: userId,
      status: 'active',
      started_at: new Date().toISOString(),
    } as any)
    .eq('id', battleId)
    .select()
    .single();

  return { data: data as unknown as ArtBattle | null, error };
}

// ── Submit an entry ──────────────────────────────────

export async function submitEntry(
  battleId: string,
  userId: string,
  imageUrl: string,
  promptUsed: string,
  postId?: string,
) {
  const { data, error } = await supabase
    .from('battle_entries')
    .insert({
      battle_id: battleId,
      user_id: userId,
      image_url: imageUrl,
      prompt_used: promptUsed,
      post_id: postId || null,
    })
    .select()
    .single();

  return { data: data as unknown as BattleEntry | null, error };
}

// ── Vote for an entry ────────────────────────────────

export async function voteBattleEntry(battleId: string, entryId: string, userId: string) {
  const { error } = await supabase
    .from('battle_votes')
    .insert({ battle_id: battleId, entry_id: entryId, user_id: userId });

  if (error) return { error };

  // Increment vote_count on the entry
  const { data: entry } = await supabase
    .from('battle_entries')
    .select('vote_count')
    .eq('id', entryId)
    .single();

  if (entry) {
    await supabase
      .from('battle_entries')
      .update({ vote_count: (entry.vote_count || 0) + 1 } as any)
      .eq('id', entryId);
  }

  return { error: null };
}

// ── Unvote an entry ──────────────────────────────────

export async function unvoteBattleEntry(battleId: string, userId: string) {
  // Find the existing vote to get the entry_id
  const { data: vote } = await supabase
    .from('battle_votes')
    .select('id, entry_id')
    .eq('battle_id', battleId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!vote) return { error: null };

  const { error } = await supabase
    .from('battle_votes')
    .delete()
    .eq('id', vote.id);

  if (error) return { error };

  // Decrement vote_count on the entry
  const { data: entry } = await supabase
    .from('battle_entries')
    .select('vote_count')
    .eq('id', vote.entry_id)
    .single();

  if (entry) {
    await supabase
      .from('battle_entries')
      .update({ vote_count: Math.max(0, (entry.vote_count || 0) - 1) } as any)
      .eq('id', vote.entry_id);
  }

  return { error: null };
}

// ── Get a single battle ──────────────────────────────

export async function getBattle(battleId: string) {
  const { data, error } = await supabase
    .from('art_battles')
    .select(
      '*, creator:profiles!creator_id(id, username, avatar_url), opponent:profiles!opponent_id(id, username, avatar_url), winner:profiles!winner_id(id, username, avatar_url)',
    )
    .eq('id', battleId)
    .single();

  return { data: data as unknown as BattleWithUsers | null, error };
}

// ── Get active/recent battles ────────────────────────

export async function getActiveBattles(page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('art_battles')
    .select(
      '*, creator:profiles!creator_id(id, username, avatar_url), opponent:profiles!opponent_id(id, username, avatar_url), winner:profiles!winner_id(id, username, avatar_url)',
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: (data || []) as unknown as BattleWithUsers[], error };
}

// ── Get entries for a battle ─────────────────────────

export async function getBattleEntries(battleId: string) {
  const { data, error } = await supabase
    .from('battle_entries')
    .select('*, user:profiles!user_id(id, username, avatar_url)')
    .eq('battle_id', battleId)
    .order('submitted_at', { ascending: true });

  return { data: (data || []) as unknown as BattleEntryWithUser[], error };
}

// ── Get user's vote for a battle ─────────────────────

export async function getUserBattleVote(battleId: string, userId: string) {
  const { data } = await supabase
    .from('battle_votes')
    .select('*')
    .eq('battle_id', battleId)
    .eq('user_id', userId)
    .maybeSingle();

  return { data: data as unknown as BattleVote | null };
}

// ── Finalize a battle ────────────────────────────────

export async function finalizeBattle(battleId: string) {
  // Get all entries with vote counts
  const { data: entries } = await supabase
    .from('battle_entries')
    .select('*')
    .eq('battle_id', battleId)
    .order('vote_count', { ascending: false });

  if (!entries || entries.length === 0) return { error: 'No entries found' };

  // Determine winner (highest vote_count)
  const winner = entries[0];
  const isTie = entries.length > 1 && entries[0].vote_count === entries[1].vote_count;

  const { data, error } = await supabase
    .from('art_battles')
    .update({
      status: 'completed',
      winner_id: isTie ? null : winner.user_id,
      completed_at: new Date().toISOString(),
    } as any)
    .eq('id', battleId)
    .select()
    .single();

  return { data: data as unknown as ArtBattle | null, error };
}

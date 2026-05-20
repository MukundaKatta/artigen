import { supabase } from '@/lib/supabase';
import type { DailyChallenge, ChallengeEntry } from '@/types';

const PAGE_SIZE = 20;

// ── Helpers ──────────────────────────────────────────

function todayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// ── Fetch today's challenge ──────────────────────────

export async function getTodayChallenge(): Promise<{ data: DailyChallenge | null; error: Error | null }> {
  const today = todayDateString();

  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('date', today)
    .maybeSingle();

  return { data: data as DailyChallenge | null, error };
}

// ── Submit an entry ──────────────────────────────────

export async function submitEntry(challengeId: string, postId: string, userId: string) {
  const { data, error } = await supabase
    .from('challenge_entries')
    .insert({ challenge_id: challengeId, post_id: postId, user_id: userId })
    .select()
    .single();

  return { data: data as unknown as ChallengeEntry | null, error };
}

// ── Vote for an entry ────────────────────────────────

export async function voteEntry(entryId: string, userId: string) {
  // Insert vote
  const { error } = await supabase
    .from('challenge_votes')
    .insert({ entry_id: entryId, user_id: userId });

  if (error) return { error };

  // Increment vote_count on the entry
  const { data: entry } = await supabase
    .from('challenge_entries')
    .select('vote_count')
    .eq('id', entryId)
    .single();

  if (entry) {
    await supabase
      .from('challenge_entries')
      .update({ vote_count: (entry.vote_count || 0) + 1 } as any)
      .eq('id', entryId);
  }

  return { error: null };
}

// ── Unvote an entry ──────────────────────────────────

export async function unvoteEntry(entryId: string, userId: string) {
  const { error } = await supabase
    .from('challenge_votes')
    .delete()
    .eq('entry_id', entryId)
    .eq('user_id', userId);

  if (error) return { error };

  // Decrement vote_count on the entry
  const { data: entry } = await supabase
    .from('challenge_entries')
    .select('vote_count')
    .eq('id', entryId)
    .single();

  if (entry) {
    await supabase
      .from('challenge_entries')
      .update({ vote_count: Math.max(0, (entry.vote_count || 0) - 1) } as any)
      .eq('id', entryId);
  }

  return { error: null };
}

// ── Entry type with joined user + post media ─────────

export type ChallengeEntryWithDetails = ChallengeEntry & {
  user: { id: string; username: string; avatar_url: string | null };
  post: { id: string; media: { media_url: string; media_type: string }[] };
};

// ── Get entries for a challenge ──────────────────────

export async function getChallengeEntries(challengeId: string, page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('challenge_entries')
    .select('*, user:profiles!user_id(id, username, avatar_url), post:posts!post_id(id, media:post_media(media_url, media_type))')
    .eq('challenge_id', challengeId)
    .order('vote_count', { ascending: false })
    .range(from, to);

  return { data: (data || []) as unknown as ChallengeEntryWithDetails[], error };
}

// ── Past challenges ──────────────────────────────────

export async function getPastChallenges(page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .order('date', { ascending: false })
    .range(from, to);

  return { data: (data || []) as unknown as DailyChallenge[], error };
}

// ── Check if user voted ──────────────────────────────

export async function hasUserVoted(entryId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('challenge_votes')
    .select('id')
    .eq('entry_id', entryId)
    .eq('user_id', userId)
    .maybeSingle();

  return !!data;
}

// ── Batch check which entries the user has voted for ─

export async function getUserVotedEntryIds(entryIds: string[], userId: string): Promise<Set<string>> {
  if (entryIds.length === 0) return new Set();

  const { data } = await supabase
    .from('challenge_votes')
    .select('entry_id')
    .in('entry_id', entryIds)
    .eq('user_id', userId);

  return new Set(((data ?? []) as Array<{ entry_id: string }>).map((v) => v.entry_id));
}

// ── Enhanced Challenges (Round 3) ───────────────────

export async function getActiveChallenge() {
  const today = todayDateString();
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('date', today)
    .maybeSingle();
  return { data, error };
}

export async function getChallenges(page = 0, pageSize = 20) {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .order('date', { ascending: false })
    .range(from, to);
  return { data, error };
}

export async function getStreak(userId: string) {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return { data, error };
}

export async function getLeaderboard(challengeId: string, limit = 10) {
  const { data, error } = await supabase
    .from('challenge_entries')
    .select('*, post:posts!post_id(*, media:post_media(*)), user:profiles!user_id(id, username, avatar_url)')
    .eq('challenge_id', challengeId)
    .order('vote_count', { ascending: false })
    .limit(limit);
  return { data, error };
}

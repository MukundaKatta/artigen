import { supabase } from '@/lib/supabase';

// ── Types ────────────────────────────────────────────

export type WeeklyEvent = {
  id: string;
  title: string;
  description: string | null;
  theme: string;
  hashtag: string;
  cover_image_url: string | null;
  reward_badge_id: string | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
};

export type WeeklyEventEntry = {
  id: string;
  event_id: string;
  user_id: string;
  post_id: string;
  vote_count: number;
  submitted_at: string;
};

export type WeeklyEventEntryWithDetails = WeeklyEventEntry & {
  user: { id: string; username: string; avatar_url: string | null };
  post: { id: string; media: { media_url: string; media_type: string }[] };
};

// ── Get active weekly event ──────────────────────────

export async function getActiveWeeklyEvent() {
  const { data, error } = await supabase
    .from('weekly_events')
    .select('*')
    .eq('is_active', true)
    .order('starts_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data: data as unknown as WeeklyEvent | null, error };
}

// ── Get all weekly events ────────────────────────────

export async function getWeeklyEvents() {
  const { data, error } = await supabase
    .from('weekly_events')
    .select('*')
    .order('starts_at', { ascending: false });

  return { data: (data || []) as unknown as WeeklyEvent[], error };
}

// ── Submit entry ─────────────────────────────────────

export async function submitWeeklyEntry(eventId: string, userId: string, postId: string) {
  const { data, error } = await supabase
    .from('weekly_event_entries')
    .insert({
      event_id: eventId,
      user_id: userId,
      post_id: postId,
    })
    .select('*, user:profiles!user_id(id, username, avatar_url), post:posts!post_id(id, media:post_media(media_url, media_type))')
    .single();

  return { data: data as unknown as WeeklyEventEntryWithDetails | null, error };
}

// ── Vote for an entry ────────────────────────────────

export async function voteWeeklyEntry(entryId: string, userId: string) {
  const { error } = await supabase
    .from('weekly_event_votes')
    .insert({ entry_id: entryId, user_id: userId });

  if (error) return { error };

  // Increment vote_count on the entry
  const { data: entry } = await supabase
    .from('weekly_event_entries')
    .select('vote_count')
    .eq('id', entryId)
    .single();

  if (entry) {
    await supabase
      .from('weekly_event_entries')
      .update({ vote_count: (entry.vote_count || 0) + 1 } as any)
      .eq('id', entryId);
  }

  return { error: null };
}

// ── Unvote an entry ──────────────────────────────────

export async function unvoteWeeklyEntry(entryId: string, userId: string) {
  const { error } = await supabase
    .from('weekly_event_votes')
    .delete()
    .eq('entry_id', entryId)
    .eq('user_id', userId);

  if (error) return { error };

  // Decrement vote_count on the entry
  const { data: entry } = await supabase
    .from('weekly_event_entries')
    .select('vote_count')
    .eq('id', entryId)
    .single();

  if (entry) {
    await supabase
      .from('weekly_event_entries')
      .update({ vote_count: Math.max(0, (entry.vote_count || 0) - 1) } as any)
      .eq('id', entryId);
  }

  return { error: null };
}

// ── Get entries for a weekly event ───────────────────

export async function getWeeklyEntries(eventId: string) {
  const { data, error } = await supabase
    .from('weekly_event_entries')
    .select('*, user:profiles!user_id(id, username, avatar_url), post:posts!post_id(id, media:post_media(media_url, media_type))')
    .eq('event_id', eventId)
    .order('vote_count', { ascending: false });

  return { data: (data || []) as unknown as WeeklyEventEntryWithDetails[], error };
}

// ── Get leaderboard ──────────────────────────────────

export async function getWeeklyLeaderboard(eventId: string, limit = 10) {
  const { data, error } = await supabase
    .from('weekly_event_entries')
    .select('*, user:profiles!user_id(id, username, avatar_url), post:posts!post_id(id, media:post_media(media_url, media_type))')
    .eq('event_id', eventId)
    .order('vote_count', { ascending: false })
    .limit(limit);

  return { data: (data || []) as unknown as WeeklyEventEntryWithDetails[], error };
}

// ── Get which entries the user has voted for ─────────

export async function getUserVotedWeeklyEntryIds(entryIds: string[], userId: string): Promise<Set<string>> {
  if (entryIds.length === 0) return new Set();

  const { data } = await supabase
    .from('weekly_event_votes')
    .select('entry_id')
    .in('entry_id', entryIds)
    .eq('user_id', userId);

  return new Set((data || []).map((v: any) => v.entry_id));
}

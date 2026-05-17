import { supabase } from '@/lib/supabase';

// ── Types ────────────────────────────────────────────

export type Mentorship = {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  focus_areas: string[];
  message: string | null;
  created_at: string;
  accepted_at: string | null;
};

export type MentorshipWithProfiles = Mentorship & {
  mentor: { id: string; username: string; avatar_url: string | null };
  mentee: { id: string; username: string; avatar_url: string | null };
};

export type MentorshipSession = {
  id: string;
  mentorship_id: string;
  post_id: string | null;
  feedback: string;
  rating: number | null;
  created_at: string;
};

export type MentorshipSessionWithPost = MentorshipSession & {
  post?: { id: string; media: { media_url: string; media_type: string }[] } | null;
};

// ── Request mentorship ───────────────────────────────

export async function requestMentorship(
  menteeId: string,
  mentorId: string,
  focusAreas: string[],
  message: string,
) {
  const { data, error } = await supabase
    .from('mentorships')
    .insert({
      mentee_id: menteeId,
      mentor_id: mentorId,
      focus_areas: focusAreas,
      message,
    })
    .select('*, mentor:profiles!mentor_id(id, username, avatar_url), mentee:profiles!mentee_id(id, username, avatar_url)')
    .single();

  return { data: data as unknown as MentorshipWithProfiles | null, error };
}

// ── Respond to mentorship request ────────────────────

export async function respondToMentorship(mentorshipId: string, accept: boolean) {
  const status = accept ? 'active' : 'cancelled';
  const updateData: Record<string, any> = { status };
  if (accept) {
    updateData.accepted_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('mentorships')
    .update(updateData as any)
    .eq('id', mentorshipId)
    .select('*, mentor:profiles!mentor_id(id, username, avatar_url), mentee:profiles!mentee_id(id, username, avatar_url)')
    .single();

  return { data: data as unknown as MentorshipWithProfiles | null, error };
}

// ── Get my mentorships ───────────────────────────────

export async function getMyMentorships(userId: string) {
  const { data, error } = await supabase
    .from('mentorships')
    .select('*, mentor:profiles!mentor_id(id, username, avatar_url), mentee:profiles!mentee_id(id, username, avatar_url)')
    .or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  return { data: (data || []) as unknown as MentorshipWithProfiles[], error };
}

// ── Get sessions for a mentorship ────────────────────

export async function getMentorshipSessions(mentorshipId: string) {
  const { data, error } = await supabase
    .from('mentorship_sessions')
    .select('*, post:posts!post_id(id, media:post_media(media_url, media_type))')
    .eq('mentorship_id', mentorshipId)
    .order('created_at', { ascending: false });

  return { data: (data || []) as unknown as MentorshipSessionWithPost[], error };
}

// ── Add a session ────────────────────────────────────

export async function addSession(
  mentorshipId: string,
  feedback: string,
  postId?: string,
  rating?: number,
) {
  const { data, error } = await supabase
    .from('mentorship_sessions')
    .insert({
      mentorship_id: mentorshipId,
      feedback,
      post_id: postId || null,
      rating: rating || null,
    })
    .select('*, post:posts!post_id(id, media:post_media(media_url, media_type))')
    .single();

  return { data: data as unknown as MentorshipSessionWithPost | null, error };
}

// ── Find potential mentors ───────────────────────────

export async function findMentors(limit = 20) {
  // Find top creators who have the mentor badge
  const { data, error } = await supabase
    .from('user_badges')
    .select('user:profiles!user_id(id, username, full_name, avatar_url, is_verified)')
    .eq('badge_id', 'mentor')
    .limit(limit);

  type MentorProfile = { id: string; username: string; full_name: string; avatar_url: string | null; is_verified: boolean };
  type MentorRow = { user: MentorProfile | null };
  const mentors = ((data ?? []) as unknown as MentorRow[])
    .map((row) => row.user)
    .filter((u): u is MentorProfile => u != null);
  return { data: mentors, error };
}

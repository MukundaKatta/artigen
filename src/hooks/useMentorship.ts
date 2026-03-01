import { useState, useEffect, useCallback } from 'react';
import {
  getMyMentorships,
  getMentorshipSessions,
  requestMentorship,
  respondToMentorship,
  addSession,
} from '@/services/mentorship.service';
import type {
  MentorshipWithProfiles,
  MentorshipSessionWithPost,
} from '@/services/mentorship.service';

export function useMentorship(userId: string | undefined) {
  const [mentorships, setMentorships] = useState<MentorshipWithProfiles[]>([]);
  const [sessions, setSessions] = useState<MentorshipSessionWithPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // ── Fetch all mentorships ──────────────────────────

  const fetchMentorships = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await getMyMentorships(userId);
    setMentorships(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchMentorships();
  }, [fetchMentorships]);

  // ── Fetch sessions for a specific mentorship ───────

  const fetchSessions = useCallback(async (mentorshipId: string) => {
    setSessionsLoading(true);
    const { data } = await getMentorshipSessions(mentorshipId);
    setSessions(data);
    setSessionsLoading(false);
  }, []);

  // ── Request mentorship ─────────────────────────────

  const request = useCallback(
    async (mentorId: string, focusAreas: string[], message: string) => {
      if (!userId) return { error: new Error('Not logged in') };

      const { data, error } = await requestMentorship(userId, mentorId, focusAreas, message);
      if (data && !error) {
        setMentorships((prev) => [data, ...prev]);
      }
      return { data, error };
    },
    [userId],
  );

  // ── Respond to mentorship ──────────────────────────

  const respond = useCallback(
    async (mentorshipId: string, accept: boolean) => {
      const { data, error } = await respondToMentorship(mentorshipId, accept);
      if (data && !error) {
        setMentorships((prev) =>
          prev.map((m) => (m.id === mentorshipId ? data : m)),
        );
      }
      return { data, error };
    },
    [],
  );

  // ── Add session ────────────────────────────────────

  const createSession = useCallback(
    async (mentorshipId: string, feedback: string, postId?: string, rating?: number) => {
      const { data, error } = await addSession(mentorshipId, feedback, postId, rating);
      if (data && !error) {
        setSessions((prev) => [data, ...prev]);
      }
      return { data, error };
    },
    [],
  );

  return {
    mentorships,
    sessions,
    loading,
    sessionsLoading,
    request,
    respond,
    addSession: createSession,
    fetchSessions,
    refresh: fetchMentorships,
  };
}

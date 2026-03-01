import { useState, useEffect, useCallback } from 'react';
import {
  getEvent,
  getAttendees,
  rsvpEvent,
  getUserRsvp,
} from '@/services/event.service';
import type {
  AppEventWithHost,
  EventAttendeeWithUser,
  EventAttendee,
} from '@/services/event.service';

export function useEvent(eventId: string | undefined, userId: string | undefined) {
  const [event, setEvent] = useState<AppEventWithHost | null>(null);
  const [attendees, setAttendees] = useState<EventAttendeeWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAttending, setIsAttending] = useState<EventAttendee['rsvp_status'] | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [eventRes, attendeesRes] = await Promise.all([
      getEvent(eventId),
      getAttendees(eventId),
    ]);

    if (eventRes.data) setEvent(eventRes.data);
    setAttendees(attendeesRes.data);

    if (userId) {
      const { rsvpStatus } = await getUserRsvp(eventId, userId);
      setIsAttending(rsvpStatus);
    }

    setLoading(false);
  }, [eventId, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const rsvp = useCallback(
    async (status: EventAttendee['rsvp_status']) => {
      if (!eventId || !userId || rsvpLoading) return;

      setRsvpLoading(true);

      const previousStatus = isAttending;

      // Optimistic update
      setIsAttending(status === 'not_going' ? null : status);
      setEvent((prev) => {
        if (!prev) return prev;
        const wasAttending = previousStatus === 'going' || previousStatus === 'interested';
        const willAttend = status === 'going' || status === 'interested';

        let countDelta = 0;
        if (!wasAttending && willAttend) countDelta = 1;
        if (wasAttending && !willAttend) countDelta = -1;

        return { ...prev, attendee_count: Math.max(0, prev.attendee_count + countDelta) };
      });

      const { error } = await rsvpEvent(eventId, userId, status);

      if (error) {
        // Revert
        setIsAttending(previousStatus);
        setEvent((prev) => {
          if (!prev) return prev;
          const wasAttending = previousStatus === 'going' || previousStatus === 'interested';
          const willAttend = status === 'going' || status === 'interested';

          let countDelta = 0;
          if (!wasAttending && willAttend) countDelta = -1;
          if (wasAttending && !willAttend) countDelta = 1;

          return { ...prev, attendee_count: Math.max(0, prev.attendee_count + countDelta) };
        });
      }

      setRsvpLoading(false);
    },
    [eventId, userId, isAttending, rsvpLoading],
  );

  return {
    event,
    attendees,
    loading,
    isAttending,
    rsvpLoading,
    rsvp,
    refresh: fetchData,
  };
}

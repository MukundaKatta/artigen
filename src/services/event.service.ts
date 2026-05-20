import { supabase } from '@/lib/supabase';

// ── Types ────────────────────────────────────────────

export type AppEvent = {
  id: string;
  title: string;
  description: string | null;
  event_type: 'workshop' | 'ama' | 'livestream' | 'challenge_event' | 'meetup';
  host_id: string;
  community_id: string | null;
  cover_image_url: string | null;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  max_attendees: number | null;
  attendee_count: number;
  starts_at: string;
  ends_at: string | null;
  meeting_url: string | null;
  created_at: string;
};

export type AppEventWithHost = AppEvent & {
  host: { id: string; username: string; avatar_url: string | null };
};

export type EventAttendee = {
  id: string;
  event_id: string;
  user_id: string;
  rsvp_status: 'going' | 'interested' | 'not_going';
  created_at: string;
};

export type EventAttendeeWithUser = EventAttendee & {
  user: { id: string; username: string; avatar_url: string | null };
};

// ── Get upcoming events ──────────────────────────────

export async function getUpcomingEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*, host:profiles!host_id(id, username, avatar_url)')
    .in('status', ['upcoming', 'live'])
    .order('starts_at', { ascending: true });

  return { data: (data || []) as unknown as AppEventWithHost[], error };
}

// ── Get all events ───────────────────────────────────

export async function getEvents(status?: string) {
  let query = supabase
    .from('events')
    .select('*, host:profiles!host_id(id, username, avatar_url)')
    .order('starts_at', { ascending: false });

  if (status) {
    query = query.eq('status', status as 'upcoming' | 'live' | 'completed' | 'cancelled');
  }

  const { data, error } = await query;
  return { data: (data || []) as unknown as AppEventWithHost[], error };
}

// ── Get single event ─────────────────────────────────

export async function getEvent(id: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*, host:profiles!host_id(id, username, avatar_url)')
    .eq('id', id)
    .single();

  return { data: data as unknown as AppEventWithHost | null, error };
}

// ── Create event ─────────────────────────────────────

type CreateEventParams = {
  title: string;
  description?: string;
  event_type: AppEvent['event_type'];
  community_id?: string;
  cover_image_url?: string;
  max_attendees?: number;
  starts_at: string;
  ends_at?: string;
  meeting_url?: string;
};

export async function createEvent(hostId: string, params: CreateEventParams) {
  const { data, error } = await supabase
    .from('events')
    .insert({
      host_id: hostId,
      title: params.title,
      description: params.description || null,
      event_type: params.event_type,
      community_id: params.community_id || null,
      cover_image_url: params.cover_image_url || null,
      max_attendees: params.max_attendees || null,
      starts_at: params.starts_at,
      ends_at: params.ends_at || null,
      meeting_url: params.meeting_url || null,
    })
    .select('*, host:profiles!host_id(id, username, avatar_url)')
    .single();

  return { data: data as unknown as AppEventWithHost | null, error };
}

// ── RSVP to event ────────────────────────────────────

export async function rsvpEvent(
  eventId: string,
  userId: string,
  status: EventAttendee['rsvp_status'],
) {
  const { data: existing } = await supabase
    .from('event_attendees')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    if (status === 'not_going') {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (!error) {
        // Decrement attendee_count (awaited so caller sees real result)
        const { data } = await supabase
          .from('events')
          .select('attendee_count')
          .eq('id', eventId)
          .single();
        if (data) {
          await supabase
            .from('events')
            .update({ attendee_count: Math.max(0, (data.attendee_count || 1) - 1) })
            .eq('id', eventId);
        }
      }

      return { error };
    }

    const { error } = await supabase
      .from('event_attendees')
      .update({ rsvp_status: status })
      .eq('event_id', eventId)
      .eq('user_id', userId);

    return { error };
  }

  const { error } = await supabase
    .from('event_attendees')
    .insert({ event_id: eventId, user_id: userId, rsvp_status: status });

  if (!error && status !== 'not_going') {
    // Increment attendee_count (awaited)
    const { data } = await supabase
      .from('events')
      .select('attendee_count')
      .eq('id', eventId)
      .single();
    if (data) {
      await supabase
        .from('events')
        .update({ attendee_count: (data.attendee_count || 0) + 1 })
        .eq('id', eventId);
    }
  }

  return { error };
}

// ── Get attendees ────────────────────────────────────

export async function getAttendees(eventId: string) {
  const { data, error } = await supabase
    .from('event_attendees')
    .select('*, user:profiles!user_id(id, username, avatar_url)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  return { data: (data || []) as unknown as EventAttendeeWithUser[], error };
}

// ── Update event status ──────────────────────────────

export async function updateEventStatus(eventId: string, status: AppEvent['status']) {
  const { error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', eventId);

  return { error };
}

// ── Check if user is attending ───────────────────────

export async function getUserRsvp(eventId: string, userId: string) {
  const { data } = await supabase
    .from('event_attendees')
    .select('rsvp_status')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle();

  return { rsvpStatus: (data?.rsvp_status as EventAttendee['rsvp_status']) || null };
}

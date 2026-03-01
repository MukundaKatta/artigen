import { useState, useEffect, useCallback } from 'react';
import { getUpcomingEvents, getEvents } from '@/services/event.service';
import type { AppEventWithHost } from '@/services/event.service';

export function useEvents() {
  const [events, setEvents] = useState<AppEventWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const fetchEvents = useCallback(async () => {
    setLoading(true);

    if (!statusFilter) {
      // Default: show upcoming + live
      const { data } = await getUpcomingEvents();
      setEvents(data);
    } else {
      const { data } = await getEvents(statusFilter);
      setEvents(data);
    }

    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filter = useCallback((status: string | undefined) => {
    setStatusFilter(status);
  }, []);

  const refresh = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    statusFilter,
    filter,
    refresh,
  };
}

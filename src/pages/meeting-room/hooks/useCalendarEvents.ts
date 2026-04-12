import { useState, useEffect, useCallback } from 'react';
import { mockFetchCalendarEvents } from '@/data/meeting-room/mockService';
import type { CalendarEvent } from '../types';

export function useCalendarEvents(startDate: string | null, endDate: string | null) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!startDate || !endDate) {
      setEvents([]);
      return;
    }
    setLoading(true);
    setError(null);
    mockFetchCalendarEvents(startDate, endDate)
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { events, loading, error, refetch };
}

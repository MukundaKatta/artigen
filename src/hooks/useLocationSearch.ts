import { useState, useCallback, useRef, useEffect } from 'react';
import { searchLocations } from '@/services/location.service';
import type { Location } from '@/types';

// Don't hit the server until the user has typed something searchable.
const MIN_QUERY_LENGTH = 2;

export function useLocationSearch() {
  const [results, setResults] = useState<Location[]>([]);
  const [searching, setSearching] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback((query: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (query.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    timeoutRef.current = setTimeout(async () => {
      const { data } = await searchLocations(query);
      setResults(data);
      setSearching(false);
    }, 300);
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setSearching(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    results,
    searching,
    search,
    clear,
  };
}

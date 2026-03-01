import { useState, useEffect, useCallback } from 'react';
import { getExhibitions } from '@/services/exhibition.service';
import type { ExhibitionWithCurator } from '@/services/exhibition.service';

export function useExhibitions() {
  const [exhibitions, setExhibitions] = useState<ExhibitionWithCurator[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const fetchExhibitions = useCallback(async () => {
    setLoading(true);
    const { data } = await getExhibitions(statusFilter);
    setExhibitions(data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchExhibitions();
  }, [fetchExhibitions]);

  const filter = useCallback((status: string | undefined) => {
    setStatusFilter(status);
  }, []);

  const refresh = useCallback(() => {
    fetchExhibitions();
  }, [fetchExhibitions]);

  return {
    exhibitions,
    loading,
    statusFilter,
    filter,
    refresh,
  };
}

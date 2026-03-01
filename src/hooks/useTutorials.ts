import { useState, useEffect, useCallback } from 'react';
import { getTutorials, getAllProgress } from '@/services/tutorial.service';
import type { Tutorial, UserTutorialProgress } from '@/services/tutorial.service';

export function useTutorials(userId: string | undefined) {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserTutorialProgress>>({});
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | undefined>(undefined);

  const fetchTutorials = useCallback(async () => {
    setLoading(true);

    const { data } = await getTutorials(category);
    setTutorials(data);

    if (userId) {
      const { data: progressData } = await getAllProgress(userId);
      const map: Record<string, UserTutorialProgress> = {};
      progressData.forEach((p) => {
        map[p.tutorial_id] = p;
      });
      setProgressMap(map);
    }

    setLoading(false);
  }, [category, userId]);

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

  const filterByCategory = useCallback((cat: string | undefined) => {
    setCategory(cat);
  }, []);

  const refresh = useCallback(() => {
    fetchTutorials();
  }, [fetchTutorials]);

  return {
    tutorials,
    progressMap,
    loading,
    category,
    filterByCategory,
    refresh,
  };
}

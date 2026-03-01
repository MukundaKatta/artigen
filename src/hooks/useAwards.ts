import { useState, useEffect, useCallback } from 'react';
import {
  getAwardTypes,
  giveAward,
  getPostAwards,
  AwardSummaryItem,
} from '@/services/award.service';
import type { AwardType } from '@/types';

export function useAwards(postId: string | undefined) {
  const [awardTypes, setAwardTypes] = useState<AwardType[]>([]);
  const [postAwards, setPostAwards] = useState<AwardSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [giving, setGiving] = useState(false);

  // Fetch award types
  useEffect(() => {
    getAwardTypes().then(({ data }) => {
      setAwardTypes(data);
    });
  }, []);

  // Fetch post awards
  const fetchPostAwards = useCallback(async () => {
    if (!postId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await getPostAwards(postId);
    setPostAwards(data);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchPostAwards();
  }, [fetchPostAwards]);

  const give = useCallback(
    async (userId: string, awardTypeId: string) => {
      if (!postId || giving) return null;
      setGiving(true);

      const { data, error } = await giveAward(postId, userId, awardTypeId);

      if (data && !error) {
        // Optimistic update: increment or add award in summary
        setPostAwards((prev) => {
          const existing = prev.find((a) => a.award_type_id === awardTypeId);
          if (existing) {
            return prev.map((a) =>
              a.award_type_id === awardTypeId ? { ...a, count: a.count + 1 } : a
            );
          }
          const type = awardTypes.find((t) => t.id === awardTypeId);
          return [
            ...prev,
            {
              award_type_id: awardTypeId,
              emoji: type?.emoji || '',
              name: type?.name || '',
              count: 1,
            },
          ];
        });
      }

      setGiving(false);
      return data;
    },
    [postId, giving, awardTypes]
  );

  return {
    awardTypes,
    postAwards,
    loading,
    giving,
    give,
    refresh: fetchPostAwards,
  };
}

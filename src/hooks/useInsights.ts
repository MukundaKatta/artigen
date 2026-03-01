import { useState, useCallback } from 'react';
import { getPostInsights } from '@/services/insights.service';
import type { PostInsights } from '@/types';

export function useInsights(postId: string | undefined) {
  const [insights, setInsights] = useState<PostInsights | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const { data } = await getPostInsights(postId);
    setInsights(data);
    setLoading(false);
  }, [postId]);

  return {
    insights,
    loading,
    fetchInsights,
  };
}

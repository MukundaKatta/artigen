import { useState, useCallback, useEffect } from 'react';
import { getContentLabel, rateContent } from '@/services/safety.service';

export function useContentLabel(postId?: string) {
  const [label, setLabel] = useState<any>(null);

  const fetch = useCallback(async () => {
    if (!postId) return;
    const { data } = await getContentLabel(postId);
    setLabel(data);
  }, [postId]);

  useEffect(() => { fetch(); }, [fetch]);

  const rate = useCallback(async (userId: string, rating: 'safe' | 'sensitive' | 'mature' | 'nsfw') => {
    if (!postId) return;
    return rateContent(postId, userId, rating);
  }, [postId]);

  return { label, rate, refresh: fetch };
}

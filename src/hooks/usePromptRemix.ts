import { useState, useCallback, useEffect } from 'react';
import { getRemixCredits, getRemixesOfPrompt } from '@/services/prompt-remix.service';

export function usePromptRemix(postId?: string) {
  const [remixCredits, setRemixCredits] = useState<any>(null);
  const [remixes, setRemixes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCredits = useCallback(async () => {
    if (!postId) return;
    const { data } = await getRemixCredits(postId);
    setRemixCredits(data);
  }, [postId]);

  const fetchRemixes = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const { data } = await getRemixesOfPrompt(postId);
    setRemixes(data || []);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { remixCredits, remixes, loading, fetchRemixes };
}

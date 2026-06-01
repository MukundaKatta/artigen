import { useState, useCallback } from 'react';
import { findSimilarPosts, searchByImage as searchByImageApi } from '@/services/similarity.service';

export function useVisualSearch() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchByImage = useCallback(async (imageUrl: string) => {
    setLoading(true);
    const { data } = await searchByImageApi(imageUrl);
    setResults(data || []);
    setLoading(false);
  }, []);

  const findSimilar = useCallback(async (postId: string) => {
    setLoading(true);
    const { data } = await findSimilarPosts(postId);
    setResults(data || []);
    setLoading(false);
  }, []);

  return { results, loading, searchByImage, findSimilar, clear: () => setResults([]) };
}

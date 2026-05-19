import { useState, useCallback, useEffect } from 'react';
import { getBlendFeed } from '@/services/blend.service';

export function useBlendFeed(blendId?: string) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const fetch = useCallback(
    async (p = 0) => {
      if (!blendId) return;
      setLoading(true);
      const { data } = await getBlendFeed(blendId, p);
      if (p === 0) setPosts(data || []);
      else setPosts((prev) => [...prev, ...(data || [])]);
      setLoading(false);
    },
    [blendId],
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  const loadMore = useCallback(() => {
    const next = page + 1;
    setPage(next);
    fetch(next);
  }, [page, fetch]);

  const refresh = useCallback(() => {
    setPage(0);
    fetch(0);
  }, [fetch]);

  return { posts, loading, loadMore, refresh };
}

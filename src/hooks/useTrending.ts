import { useState, useCallback, useEffect } from 'react';
import * as trendingService from '@/services/trending.service';

export function useTrending() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const [promptRes, styleRes] = await Promise.all([
      trendingService.getTrendingPrompts(),
      trendingService.getTrendingStyles(),
    ]);
    setPrompts(promptRes.data || []);
    setStyles(styleRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { prompts, styles, loading, refresh: fetch };
}

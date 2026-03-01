import { useState, useCallback, useEffect } from 'react';
import * as tasteService from '@/services/taste-profile.service';

export function useTasteProfile(userId?: string) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await tasteService.getTasteProfile(userId);
    setProfile(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const update = useCallback(async (updates: {
    preferredStyles?: string[];
    preferredModels?: string[];
    preferredThemes?: string[];
    preferredPalettes?: string[];
    dislikedStyles?: string[];
    dislikedThemes?: string[];
  }) => {
    if (!userId) return;
    const { data, error } = await tasteService.updateTasteProfile(userId, updates);
    if (!error && data) setProfile(data);
    return { error };
  }, [userId]);

  return { profile, loading, update, refresh: fetch };
}

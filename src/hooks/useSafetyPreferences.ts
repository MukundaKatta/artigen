import { useState, useCallback, useEffect } from 'react';
import { getSafetyPreferences, updateSafetyPreferences } from '@/services/safety.service';

export function useSafetyPreferences(userId?: string) {
  const [prefs, setPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await getSafetyPreferences(userId);
    setPrefs(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const update = useCallback(async (updates: {
    showSensitive?: boolean;
    showMature?: boolean;
    blurNsfw?: boolean;
    ageVerified?: boolean;
  }) => {
    if (!userId) return;
    const { data, error } = await updateSafetyPreferences(userId, updates);
    if (!error && data) setPrefs(data);
    return { error };
  }, [userId]);

  return { prefs, loading, update, refresh: fetch };
}

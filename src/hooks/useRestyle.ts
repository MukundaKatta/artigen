import { useState, useCallback, useEffect } from 'react';
import { getRestyleJob, getStylePresets, createRestyleJob } from '@/services/restyle.service';
import { useJobPolling } from '@/hooks/useJobPolling';

export function useRestyle(userId?: string) {
  const [presets, setPresets] = useState<any[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const { job, loading, setLoading, startPolling } = useJobPolling(getRestyleJob);

  const fetchPresets = useCallback(async (category?: string) => {
    const { data } = await getStylePresets(category);
    setPresets(data || []);
  }, []);

  useEffect(() => { fetchPresets(); }, [fetchPresets]);

  const startRestyle = useCallback(async (sourceImageUrl: string, sourcePostId?: string, customPrompt?: string) => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await createRestyleJob({
      userId,
      sourcePostId,
      sourceImageUrl,
      stylePresetId: selectedPreset?.id,
      customStylePrompt: customPrompt,
    });
    if (data) {
      startPolling(data);
    } else {
      setLoading(false);
    }
    return { data, error };
  }, [userId, selectedPreset, setLoading, startPolling]);

  return { presets, selectedPreset, setSelectedPreset, job, loading, startRestyle, fetchPresets };
}

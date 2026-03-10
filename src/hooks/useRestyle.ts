import { useState, useCallback, useEffect } from 'react';
import * as restyleService from '@/services/restyle.service';
import { useJobPolling } from '@/hooks/useJobPolling';

export function useRestyle(userId?: string) {
  const [presets, setPresets] = useState<any[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const { job, loading, setLoading, startPolling } = useJobPolling(restyleService.getRestyleJob);

  const fetchPresets = useCallback(async (category?: string) => {
    const { data } = await restyleService.getStylePresets(category);
    setPresets(data || []);
  }, []);

  useEffect(() => { fetchPresets(); }, [fetchPresets]);

  const startRestyle = useCallback(async (sourceImageUrl: string, sourcePostId?: string, customPrompt?: string) => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await restyleService.createRestyleJob({
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

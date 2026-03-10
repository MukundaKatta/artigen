import { useState, useCallback, useEffect } from 'react';
import * as controlnetService from '@/services/controlnet.service';
import { useJobPolling } from '@/hooks/useJobPolling';

export function useControlNet(userId?: string) {
  const [presets, setPresets] = useState<any[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const { job, loading, setLoading, startPolling } = useJobPolling(controlnetService.getControlNetJob);

  const fetchPresets = useCallback(async (controlType?: string) => {
    const { data } = await controlnetService.getControlNetPresets(controlType);
    setPresets(data || []);
  }, []);

  useEffect(() => { fetchPresets(); }, [fetchPresets]);

  const startControlNet = useCallback(async (controlImageUrl: string, controlType: string, prompt: string, sourcePostId?: string, negativePrompt?: string, controlStrength?: number) => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await controlnetService.createControlNetJob({
      userId,
      sourcePostId,
      controlImageUrl,
      controlType,
      prompt,
      negativePrompt,
      controlStrength,
    });
    if (data) {
      startPolling(data);
    } else {
      setLoading(false);
    }
    return { data, error };
  }, [userId, setLoading, startPolling]);

  return { presets, selectedPreset, setSelectedPreset, job, loading, startControlNet, fetchPresets };
}

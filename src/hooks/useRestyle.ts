import { useState, useCallback, useEffect, useRef } from 'react';
import * as restyleService from '@/services/restyle.service';

export function useRestyle(userId?: string) {
  const [presets, setPresets] = useState<any[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

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
      setJob(data);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        const { data: updated } = await restyleService.getRestyleJob(data.id);
        if (updated) {
          setJob(updated);
          if (updated.status === 'completed' || updated.status === 'failed') {
            clearInterval(pollRef.current);
            setLoading(false);
          }
        }
      }, 3000);
    } else {
      setLoading(false);
    }
    return { data, error };
  }, [userId, selectedPreset]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  return { presets, selectedPreset, setSelectedPreset, job, loading, startRestyle, fetchPresets };
}

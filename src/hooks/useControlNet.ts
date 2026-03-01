import { useState, useCallback, useEffect, useRef } from 'react';
import * as controlnetService from '@/services/controlnet.service';

export function useControlNet(userId?: string) {
  const [presets, setPresets] = useState<any[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

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
      setJob(data);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        const { data: updated } = await controlnetService.getControlNetJob(data.id);
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
  }, [userId]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  return { presets, selectedPreset, setSelectedPreset, job, loading, startControlNet, fetchPresets };
}

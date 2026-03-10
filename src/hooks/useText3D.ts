import { useCallback } from 'react';
import * as text3DService from '@/services/text-to-3d.service';
import { useJobPolling } from '@/hooks/useJobPolling';

export function useText3D(userId?: string) {
  const { job, loading, setLoading, startPolling } = useJobPolling(text3DService.getText3DJob);

  const generate = useCallback(
    async (prompt: string, negativePrompt?: string, modelId?: string, settings?: Record<string, any>) => {
      if (!userId) return;
      setLoading(true);
      const { data, error } = await text3DService.createText3DJob(userId, prompt, negativePrompt, modelId, settings);
      if (data) {
        startPolling(data);
      } else {
        setLoading(false);
      }
      return { data, error };
    },
    [userId, setLoading, startPolling],
  );

  return { job, loading, generate };
}

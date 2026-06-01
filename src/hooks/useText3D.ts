import { useCallback } from 'react';
import { createText3DJob, getText3DJob } from '@/services/text-to-3d.service';
import { useJobPolling } from '@/hooks/useJobPolling';

export function useText3D(userId?: string) {
  const { job, loading, setLoading, startPolling } = useJobPolling(getText3DJob);

  const generate = useCallback(
    async (prompt: string, negativePrompt?: string, modelId?: string, settings?: Record<string, any>) => {
      if (!userId) return;
      setLoading(true);
      const { data, error } = await createText3DJob(userId, prompt, negativePrompt, modelId, settings);
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

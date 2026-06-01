import { useCallback } from 'react';
import { createOutpaintingJob, getOutpaintingJob } from '@/services/outpainting.service';
import { useJobPolling } from '@/hooks/useJobPolling';

export function useOutpainting(userId?: string) {
  const { job, loading, setLoading, startPolling } = useJobPolling(getOutpaintingJob);

  const startOutpainting = useCallback(async (sourceImageUrl: string, direction: 'left' | 'right' | 'up' | 'down' | 'all', sourcePostId?: string, prompt?: string, expandPixels?: number) => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await createOutpaintingJob({
      userId,
      sourcePostId,
      sourceImageUrl,
      direction,
      expandPixels,
      prompt,
    });
    if (data) {
      startPolling(data);
    } else {
      setLoading(false);
    }
    return { data, error };
  }, [userId, setLoading, startPolling]);

  return { job, loading, startOutpainting };
}

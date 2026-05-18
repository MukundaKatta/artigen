import { useCallback } from 'react';
import { createUpscalingJob, getUpscalingJob } from '@/services/upscaling.service';
import { useJobPolling } from '@/hooks/useJobPolling';

export function useUpscaling(userId?: string) {
  const { job, loading, setLoading, startPolling } = useJobPolling(getUpscalingJob);

  const startUpscaling = useCallback(async (sourceImageUrl: string, scaleFactor?: number, sourcePostId?: string, originalWidth?: number, originalHeight?: number) => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await createUpscalingJob({
      userId,
      sourcePostId,
      sourceImageUrl,
      scaleFactor,
      originalWidth,
      originalHeight,
    });
    if (data) {
      startPolling(data);
    } else {
      setLoading(false);
    }
    return { data, error };
  }, [userId, setLoading, startPolling]);

  return { job, loading, startUpscaling };
}

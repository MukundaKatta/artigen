import { useCallback } from 'react';
import { getInpaintingJob, createInpaintingJob } from '@/services/inpainting.service';
import { useJobPolling } from '@/hooks/useJobPolling';

export function useInpainting(userId?: string) {
  const { job, loading, setLoading, startPolling } = useJobPolling(getInpaintingJob);

  const startInpainting = useCallback(
    async (
      sourceImageUrl: string,
      maskImageUrl: string,
      prompt: string,
      sourcePostId?: string,
      negativePrompt?: string,
    ) => {
      if (!userId) return;
      setLoading(true);
      const { data, error } = await createInpaintingJob({
        userId,
        sourcePostId,
        sourceImageUrl,
        maskImageUrl,
        prompt,
        negativePrompt,
      });
      if (data) {
        startPolling(data);
      } else {
        setLoading(false);
      }
      return { data, error };
    },
    [userId, setLoading, startPolling],
  );

  return { job, loading, startInpainting };
}

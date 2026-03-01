import { useState, useCallback, useEffect, useRef } from 'react';
import * as upscalingService from '@/services/upscaling.service';

export function useUpscaling(userId?: string) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const startUpscaling = useCallback(async (sourceImageUrl: string, scaleFactor?: number, sourcePostId?: string, originalWidth?: number, originalHeight?: number) => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await upscalingService.createUpscalingJob({
      userId,
      sourcePostId,
      sourceImageUrl,
      scaleFactor,
      originalWidth,
      originalHeight,
    });
    if (data) {
      setJob(data);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        const { data: updated } = await upscalingService.getUpscalingJob(data.id);
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

  return { job, loading, startUpscaling };
}

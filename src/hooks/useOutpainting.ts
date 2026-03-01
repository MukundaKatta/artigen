import { useState, useCallback, useEffect, useRef } from 'react';
import * as outpaintingService from '@/services/outpainting.service';

export function useOutpainting(userId?: string) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const startOutpainting = useCallback(async (sourceImageUrl: string, direction: 'left' | 'right' | 'up' | 'down' | 'all', sourcePostId?: string, prompt?: string, expandPixels?: number) => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await outpaintingService.createOutpaintingJob({
      userId,
      sourcePostId,
      sourceImageUrl,
      direction,
      expandPixels,
      prompt,
    });
    if (data) {
      setJob(data);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        const { data: updated } = await outpaintingService.getOutpaintingJob(data.id);
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

  return { job, loading, startOutpainting };
}

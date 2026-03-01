import { useState, useCallback, useEffect, useRef } from 'react';
import * as inpaintingService from '@/services/inpainting.service';

export function useInpainting(userId?: string) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const startInpainting = useCallback(async (sourceImageUrl: string, maskImageUrl: string, prompt: string, sourcePostId?: string, negativePrompt?: string) => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await inpaintingService.createInpaintingJob({
      userId,
      sourcePostId,
      sourceImageUrl,
      maskImageUrl,
      prompt,
      negativePrompt,
    });
    if (data) {
      setJob(data);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        const { data: updated } = await inpaintingService.getInpaintingJob(data.id);
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

  return { job, loading, startInpainting };
}

import { useState, useCallback, useEffect, useRef } from 'react';
import * as animationService from '@/services/animation.service';

type AnimationType = 'motion' | 'camera_pan' | 'parallax' | 'zoom' | 'morph';

export function useAnimation(userId?: string) {
  const [animationType, setAnimationType] = useState<AnimationType>('motion');
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const startAnimation = useCallback(async (sourceImageUrl: string, sourcePostId?: string) => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await animationService.createAnimationJob({
      userId,
      sourcePostId,
      sourceImageUrl,
      animationType,
    });
    if (data) {
      setJob(data);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        const { data: updated } = await animationService.getAnimationJob(data.id);
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
  }, [userId, animationType]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  return { animationType, setAnimationType, job, loading, startAnimation };
}

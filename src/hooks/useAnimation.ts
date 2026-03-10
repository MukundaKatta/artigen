import { useState, useCallback } from 'react';
import * as animationService from '@/services/animation.service';
import { useJobPolling } from '@/hooks/useJobPolling';

type AnimationType = 'motion' | 'camera_pan' | 'parallax' | 'zoom' | 'morph';

export function useAnimation(userId?: string) {
  const [animationType, setAnimationType] = useState<AnimationType>('motion');
  const { job, loading, setLoading, startPolling } = useJobPolling(animationService.getAnimationJob);

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
      startPolling(data);
    } else {
      setLoading(false);
    }
    return { data, error };
  }, [userId, animationType, setLoading, startPolling]);

  return { animationType, setAnimationType, job, loading, startAnimation };
}

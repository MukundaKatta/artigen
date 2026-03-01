import { useState, useCallback, useEffect, useRef } from 'react';
import * as text3DService from '@/services/text-to-3d.service';

export function useText3D(userId?: string) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const generate = useCallback(
    async (prompt: string, negativePrompt?: string, modelId?: string, settings?: Record<string, any>) => {
      if (!userId) return;
      setLoading(true);
      const { data, error } = await text3DService.createText3DJob(userId, prompt, negativePrompt, modelId, settings);
      if (data) {
        setJob(data);
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
          const { data: updated } = await text3DService.getText3DJob(data.id);
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
    },
    [userId]
  );

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return { job, loading, generate };
}

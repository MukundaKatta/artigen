import { useState, useCallback, useEffect, useRef } from 'react';
import * as musicService from '@/services/music.service';

export function useAiMusic(userId?: string) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const generate = useCallback(
    async (params: { prompt?: string; mood?: string; durationSeconds?: number; genre?: string; postId?: string }) => {
      if (!userId) return;
      setLoading(true);
      const { data, error } = await musicService.createMusicJob(userId, params);
      if (data) {
        setJob(data);
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
          const { data: updated } = await musicService.getMusicJob(data.id);
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

  const attachToPost = useCallback(
    async (postId: string, musicUrl: string, title: string) => {
      return musicService.attachMusicToPost(postId, musicUrl, title);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return { job, loading, mood, setMood, generate, attachToPost };
}

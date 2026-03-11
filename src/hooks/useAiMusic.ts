import { useState, useCallback } from 'react';
import * as musicService from '@/services/music.service';
import { useJobPolling } from '@/hooks/useJobPolling';

export function useAiMusic(userId?: string) {
  const [mood, setMood] = useState<string | null>(null);
  const { job, loading, setLoading, startPolling } = useJobPolling(musicService.getMusicJob);

  const generate = useCallback(
    async (params: { prompt?: string; mood?: string; durationSeconds?: number; genre?: string; postId?: string }) => {
      if (!userId) return;
      setLoading(true);
      const { data, error } = await musicService.createMusicJob(userId, params);
      if (data) {
        startPolling(data);
      } else {
        setLoading(false);
      }
      return { data, error };
    },
    [userId, setLoading, startPolling],
  );

  const attachToPost = useCallback(
    async (postId: string, musicUrl: string, title: string) => {
      return musicService.attachMusicToPost(postId, musicUrl, title);
    },
    [],
  );

  return { job, loading, mood, setMood, generate, attachToPost };
}

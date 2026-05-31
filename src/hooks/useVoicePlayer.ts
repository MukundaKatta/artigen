import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { logger } from '@/lib/logger';

export function useVoicePlayer() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const soundRef = useRef<Audio.Sound | null>(null);

  const play = useCallback(async (uri: string) => {
    try {
      // Stop current if playing
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, rate: speed, shouldCorrectPitch: true }
      );

      soundRef.current = sound;
      setPlaying(true);
      setProgress(0);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          setPlaying(false);
          setProgress(0);
          return;
        }
        if (status.durationMillis) {
          setProgress(status.positionMillis / status.durationMillis);
        }
      });
    } catch (err) {
      logger.warn('useVoicePlayer: play failed', err);
    }
  }, [speed]);

  const pause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setPlaying(false);
    }
  }, []);

  const resume = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setPlaying(true);
    }
  }, []);

  const togglePlay = useCallback(
    async (uri: string) => {
      if (playing) {
        await pause();
      } else if (progress > 0) {
        await resume();
      } else {
        await play(uri);
      }
    },
    [playing, progress, play, pause, resume]
  );

  const cycleSpeed = useCallback(async () => {
    const speeds = [1, 1.5, 2];
    const nextIndex = (speeds.indexOf(speed) + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setSpeed(newSpeed);

    if (soundRef.current) {
      await soundRef.current.setRateAsync(newSpeed, true);
    }
  }, [speed]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch((err) => logger.warn('Failed to unload sound:', err));
        soundRef.current = null;
      }
    };
  }, []);

  return {
    playing,
    progress,
    speed,
    togglePlay,
    cycleSpeed,
  };
}

import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { logger } from '@/lib/logger';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Recording failed';
}

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const startRecording = useCallback(async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return { error: 'Permission denied' };

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = rec;
      setRecording(true);
      setDuration(0);

      intervalRef.current = setInterval(() => {
        setDuration((d) => d + 100);
      }, 100);

      return { error: null };
    } catch (e: unknown) {
      return { error: getErrorMessage(e) };
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return { uri: null, durationMs: 0, error: 'No recording' };

    if (intervalRef.current) clearInterval(intervalRef.current);

    try {
      const uri = recordingRef.current.getURI();
      const status = await recordingRef.current.getStatusAsync();
      const durationMs = status.durationMillis || duration;

      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      recordingRef.current = null;
      setRecording(false);

      return { uri, durationMs, error: null };
    } catch (e: unknown) {
      setRecording(false);
      return { uri: null, durationMs: 0, error: getErrorMessage(e) };
    }
  }, [duration]);

  const cancelRecording = useCallback(async () => {
    if (!recordingRef.current) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch (e: unknown) {
      logger.warn('Failed to cancel recording:', e);
    }

    recordingRef.current = null;
    setRecording(false);
    setDuration(0);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recordingRef.current) {
        recordingRef.current
          .stopAndUnloadAsync()
          .catch((err) => logger.warn('Failed to stop recording:', err));
        recordingRef.current = null;
      }
    };
  }, []);

  return {
    recording,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}

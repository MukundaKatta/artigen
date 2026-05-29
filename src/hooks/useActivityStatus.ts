import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { updateLastActive } from '@/services/activity.service';

// How often we ping last-active while the app is foregrounded.
const ACTIVITY_HEARTBEAT_MS = 5 * 60 * 1000;

export function useActivityStatus(userId: string | undefined) {
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const heartbeat = useCallback(() => {
    if (userId) {
      updateLastActive(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Initial heartbeat
    heartbeat();

    // Periodic heartbeat
    intervalRef.current = setInterval(heartbeat, ACTIVITY_HEARTBEAT_MS);

    // App state listener
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        heartbeat();
      }
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      subscription.remove();
    };
  }, [userId, heartbeat]);
}

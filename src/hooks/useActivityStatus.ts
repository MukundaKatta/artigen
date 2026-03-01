import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { updateLastActive } from '@/services/activity.service';

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

    // Periodic heartbeat every 5 minutes
    intervalRef.current = setInterval(heartbeat, 5 * 60 * 1000);

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

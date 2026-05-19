import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { updateLastActive } from '@/services/activity.service';
import { ACTIVITY_HEARTBEAT_MS } from '@/lib/constants';

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

import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

type NetworkStatus = {
  isOnline: boolean;
  isReconnecting: boolean;
};

/**
 * Track device network connectivity.
 *
 * On web, uses navigator.onLine and online/offline events.
 * On native, this provides a fallback — real implementation would
 * use @react-native-community/netinfo.
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // On native, assume online — would integrate with NetInfo
      return;
    }

    const handleOnline = () => {
      setIsReconnecting(true);
      setIsOnline(true);
      // Brief reconnecting state for UI feedback
      setTimeout(() => setIsReconnecting(false), 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(false);
    };

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isReconnecting };
}

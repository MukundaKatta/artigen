import { useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';

type NotificationOptions = {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
};

export function useWebNotifications() {
  const permissionRef = useRef<NotificationPermission>('default');

  useEffect(() => {
    if (Platform.OS !== 'web' || !('Notification' in window)) return;
    permissionRef.current = Notification.permission;
  }, []);

  const requestPermission = useCallback(async () => {
    if (Platform.OS !== 'web' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const result = await Notification.requestPermission();
    permissionRef.current = result;
    return result === 'granted';
  }, []);

  const sendNotification = useCallback(({ title, body, icon, tag }: NotificationOptions) => {
    if (Platform.OS !== 'web' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    // Don't send if tab is focused
    if (document.hasFocus()) return;

    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      tag,
    });
  }, []);

  return { requestPermission, sendNotification };
}

import { useState, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
};

type ToastOptions = {
  type?: ToastType;
  duration?: number;
};

let globalId = 0;

/**
 * Toast notification hook for in-app feedback.
 *
 * Provides a queue-based system for showing transient messages.
 * Auto-dismisses after a configurable duration.
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const { type = 'info', duration = 3000 } = options;
      const id = `toast-${++globalId}`;

      const toast: Toast = { id, type, message, duration };
      setToasts((prev) => [...prev.slice(-4), toast]); // Max 5 toasts

      const timer = setTimeout(() => dismiss(id), duration);
      timersRef.current.set(id, timer);

      return id;
    },
    [dismiss],
  );

  const success = useCallback(
    (message: string, duration?: number) => show(message, { type: 'success', duration }),
    [show],
  );

  const error = useCallback(
    (message: string, duration?: number) => show(message, { type: 'error', duration: duration || 5000 }),
    [show],
  );

  const info = useCallback(
    (message: string, duration?: number) => show(message, { type: 'info', duration }),
    [show],
  );

  const warning = useCallback(
    (message: string, duration?: number) => show(message, { type: 'warning', duration: duration || 4000 }),
    [show],
  );

  return { toasts, show, success, error, info, warning, dismiss };
}

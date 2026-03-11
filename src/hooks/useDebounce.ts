import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Debounce a value — delays updating until after a pause in changes.
 * Ideal for search inputs that trigger API calls.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce a callback function.
 * Returns a stable function reference that debounces invocations.
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay = 300,
): (...args: Parameters<T>) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay],
  );
}

/**
 * Throttle a callback — execute at most once per interval.
 * Ideal for scroll handlers and resize events.
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  interval = 200,
): (...args: Parameters<T>) => void {
  const lastCallRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = interval - (now - lastCallRef.current);

      if (remaining <= 0) {
        lastCallRef.current = now;
        callback(...args);
      } else if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          timerRef.current = undefined;
          callback(...args);
        }, remaining);
      }
    },
    [callback, interval],
  );
}

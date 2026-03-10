import { useRef, useEffect, useCallback } from 'react';
import { trackPerformance } from '@/lib/telemetry';

/**
 * Track component mount/render performance.
 * Reports timing data to telemetry for monitoring.
 */
export function usePerformanceMonitor(screenName: string) {
  const mountTime = useRef(Date.now());
  const renderCount = useRef(0);

  renderCount.current++;

  useEffect(() => {
    const timeToMount = Date.now() - mountTime.current;
    trackPerformance(`${screenName}_mount`, timeToMount);

    return () => {
      trackPerformance(`${screenName}_render_count`, renderCount.current);
    };
  }, [screenName]);

  const measureAsync = useCallback(
    async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
      const start = Date.now();
      try {
        const result = await fn();
        trackPerformance(`${screenName}_${label}`, Date.now() - start);
        return result;
      } catch (error) {
        trackPerformance(`${screenName}_${label}_error`, Date.now() - start);
        throw error;
      }
    },
    [screenName],
  );

  return { measureAsync, renderCount: renderCount.current };
}

/**
 * Simple timing utility for measuring async operations.
 */
export function createTimer() {
  const start = Date.now();
  return {
    elapsed: () => Date.now() - start,
    report: (label: string) => {
      trackPerformance(label, Date.now() - start);
    },
  };
}

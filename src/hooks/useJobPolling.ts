import { useState, useCallback, useEffect, useRef } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

type JobLike = {
  id: string;
  status: JobStatus;
} & Record<string, unknown>;

/**
 * Shared hook for polling async job status.
 * Replaces duplicated setInterval polling across 7+ generation hooks.
 *
 * @param fetchJob - Function that fetches the current job state by ID
 * @param intervalMs - Polling interval in ms (default: 3000)
 */
export function useJobPolling<T extends JobLike>(
  fetchJob: (id: string) => Promise<{ data: T | null; error: PostgrestError | null }>,
  intervalMs = 3000,
) {
  const [job, setJob] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = undefined;
    }
  }, []);

  const startPolling = useCallback(
    (initialJob: JobLike) => {
      setJob(initialJob as T);
      setLoading(true);
      stopPolling();

      pollRef.current = setInterval(async () => {
        const { data: updated } = await fetchJob(initialJob.id);
        if (updated) {
          setJob(updated);
          if (updated.status === 'completed' || updated.status === 'failed') {
            stopPolling();
            setLoading(false);
          }
        }
      }, intervalMs);
    },
    [fetchJob, intervalMs, stopPolling],
  );

  const reset = useCallback(() => {
    stopPolling();
    setJob(null);
    setLoading(false);
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  return { job, loading, setLoading, startPolling, stopPolling, reset };
}

import { useState, useCallback, useRef } from 'react';

type OptimisticOptions<T> = {
  /** The current server state */
  initialData: T;
  /** Function to perform the actual mutation */
  mutate: (optimisticData: T) => Promise<void>;
  /** Called when the mutation fails and we need to rollback */
  onRollback?: (previousData: T, error: Error) => void;
};

/**
 * Hook for optimistic UI updates.
 *
 * Updates the UI immediately, then syncs with the server.
 * If the server call fails, rolls back to the previous state.
 *
 * Example: Instant like/unlike without waiting for server response.
 */
export function useOptimisticUpdate<T>({ initialData, mutate, onRollback }: OptimisticOptions<T>) {
  const [data, setData] = useState<T>(initialData);
  const [isPending, setIsPending] = useState(false);
  const previousRef = useRef<T>(initialData);

  const update = useCallback(
    async (optimisticData: T) => {
      previousRef.current = data;
      setData(optimisticData);
      setIsPending(true);

      try {
        await mutate(optimisticData);
      } catch (error) {
        // Rollback on failure
        setData(previousRef.current);
        onRollback?.(previousRef.current, error instanceof Error ? error : new Error(String(error)));
      } finally {
        setIsPending(false);
      }
    },
    [data, mutate, onRollback],
  );

  return { data, update, isPending };
}

/**
 * Simplified optimistic toggle for boolean states (like, save, follow).
 */
export function useOptimisticToggle(
  initial: boolean,
  onToggle: (newValue: boolean) => Promise<void>,
) {
  const [value, setValue] = useState(initial);
  const [isPending, setIsPending] = useState(false);

  const toggle = useCallback(async () => {
    const next = !value;
    setValue(next); // Optimistic update
    setIsPending(true);

    try {
      await onToggle(next);
    } catch {
      setValue(!next); // Rollback
    } finally {
      setIsPending(false);
    }
  }, [value, onToggle]);

  return { value, toggle, isPending };
}

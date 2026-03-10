import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@offline_cache:';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

/**
 * Hook that provides offline-first data caching via AsyncStorage.
 * Returns cached data immediately, then updates with fresh data when online.
 *
 * @param key - Unique cache key
 * @param fetcher - Async function to fetch fresh data
 * @param ttl - Cache TTL in milliseconds (default: 30 min)
 */
export function useOfflineCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL_MS,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);

  const cacheKey = `${CACHE_PREFIX}${key}`;

  const readCache = useCallback(async (): Promise<CacheEntry<T> | null> => {
    try {
      const raw = await AsyncStorage.getItem(cacheKey);
      if (!raw) return null;
      return JSON.parse(raw) as CacheEntry<T>;
    } catch {
      return null;
    }
  }, [cacheKey]);

  const writeCache = useCallback(
    async (value: T) => {
      try {
        const entry: CacheEntry<T> = { data: value, timestamp: Date.now() };
        await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
      } catch {
        // Silent fail - cache write is non-critical
      }
    },
    [cacheKey],
  );

  const refresh = useCallback(async () => {
    try {
      const freshData = await fetcher();
      setData(freshData);
      setIsStale(false);
      await writeCache(freshData);
    } catch {
      // If fetch fails, data stays as-is (either cached or null)
      setIsStale(true);
    } finally {
      setLoading(false);
    }
  }, [fetcher, writeCache]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // Step 1: Load from cache immediately
      const cached = await readCache();
      if (cached && mounted) {
        setData(cached.data);
        setLoading(false);

        const age = Date.now() - cached.timestamp;
        if (age < ttl) {
          setIsStale(false);
          return; // Cache is fresh enough
        }
        setIsStale(true);
      }

      // Step 2: Fetch fresh data
      if (mounted) {
        await refresh();
      }
    })();

    return () => {
      mounted = false;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, isStale, refresh };
}

/** Clear all offline cache entries */
export async function clearOfflineCache() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch {
    // Silent fail
  }
}

/**
 * API Response Cache with TTL, LRU eviction, and request deduplication.
 *
 * Prevents redundant network calls for identical queries within a configurable
 * time window. Also deduplicates concurrent in-flight requests so the same
 * query only hits the network once.
 */

type CacheEntry<T = unknown> = {
  data: T;
  timestamp: number;
  ttl: number;
};

const DEFAULT_TTL_MS = 30_000; // 30 seconds
const MAX_ENTRIES = 200;

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

function evictIfNeeded() {
  if (cache.size <= MAX_ENTRIES) return;
  // Evict oldest entries first (Map preserves insertion order)
  const keysToDelete = Array.from(cache.keys()).slice(0, cache.size - MAX_ENTRIES);
  for (const key of keysToDelete) {
    cache.delete(key);
  }
}

export function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttl = DEFAULT_TTL_MS): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
  evictIfNeeded();
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

/**
 * Deduplicate concurrent requests for the same key.
 * If a request is already in-flight, returns the same promise.
 */
export async function deduplicatedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = DEFAULT_TTL_MS,
): Promise<T> {
  // Check cache first
  const cached = getCached<T>(key);
  if (cached !== undefined) return cached;

  // Check if there's an in-flight request
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  // Execute and track
  const promise = fetcher()
    .then((result) => {
      setCached(key, result, ttl);
      inflight.delete(key);
      return result;
    })
    .catch((error) => {
      inflight.delete(key);
      throw error;
    });

  inflight.set(key, promise);
  return promise;
}

/**
 * Create a cache key from a table name and filter params.
 */
export function cacheKey(table: string, ...parts: (string | number | undefined)[]): string {
  return [table, ...parts.filter(Boolean)].join(':');
}

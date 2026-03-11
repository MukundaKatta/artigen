/**
 * Shared service-layer helpers that reduce boilerplate across all services.
 *
 * Provides:
 * - Typed result wrappers
 * - Pagination helpers
 * - Batch operation utilities
 * - Common query patterns
 */

import { supabase } from '@/lib/supabase';
import { withRetry, type RetryOptions } from '@/lib/retry';
import { deduplicatedFetch, cacheKey, invalidateCache } from '@/lib/api-cache';

// ── Result Type ──────────────────────────────────────────────────

export type ServiceResult<T> = {
  data: T | null;
  error: string | null;
};

export function ok<T>(data: T): ServiceResult<T> {
  return { data, error: null };
}

export function err<T = null>(message: string): ServiceResult<T> {
  return { data: null, error: message };
}

// ── Paginated Query ──────────────────────────────────────────────

export type PaginatedResult<T> = {
  data: T[];
  hasMore: boolean;
  error: string | null;
};

export function paginated<T>(data: T[], pageSize: number): PaginatedResult<T> {
  return {
    data,
    hasMore: data.length === pageSize,
    error: null,
  };
}

export function paginatedError<T>(): PaginatedResult<T> {
  return { data: [], hasMore: false, error: 'Failed to load data' };
}

// ── Cached Query Helper ──────────────────────────────────────────

type CachedQueryOptions = {
  table: string;
  key: string;
  ttl?: number;
  retry?: RetryOptions;
};

/**
 * Execute a Supabase query with caching, deduplication, and retry.
 */
export async function cachedQuery<T>(
  options: CachedQueryOptions,
  queryFn: () => Promise<{ data: T | null; error: any }>,
): Promise<ServiceResult<T>> {
  const key = cacheKey(options.table, options.key);

  try {
    const result = await deduplicatedFetch(
      key,
      async () => {
        return withRetry(async () => {
          const { data, error } = await queryFn();
          if (error) throw new Error(error.message || 'Query failed');
          return data;
        }, options.retry);
      },
      options.ttl,
    );
    return ok(result as T);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return err(message);
  }
}

// ── Mutation Helper ──────────────────────────────────────────────

/**
 * Execute a mutation (insert/update/delete) with retry and cache invalidation.
 */
export async function mutate<T>(
  table: string,
  mutationFn: () => Promise<{ data: T | null; error: any }>,
  options?: { retry?: RetryOptions },
): Promise<ServiceResult<T>> {
  try {
    const result = await withRetry(async () => {
      const { data, error } = await mutationFn();
      if (error) throw new Error(error.message || 'Mutation failed');
      return data;
    }, options?.retry);

    // Invalidate related cache entries
    invalidateCache(table);

    return ok(result as T);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return err(message);
  }
}

// ── Batch Operations ─────────────────────────────────────────────

/**
 * Execute multiple queries in parallel with a concurrency limit.
 */
export async function batchQuery<T, R>(
  items: T[],
  queryFn: (item: T) => Promise<R>,
  concurrency = 5,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(queryFn));
    results.push(...batchResults);
  }

  return results;
}

// ── Toggle Helper ────────────────────────────────────────────────

/**
 * Common pattern for like/unlike, save/unsave, follow/unfollow.
 */
export async function toggleRelation(
  table: string,
  matchColumns: Record<string, string>,
  shouldExist: boolean,
): Promise<ServiceResult<boolean>> {
  try {
    if (shouldExist) {
      const { error } = await supabase.from(table as any).insert(matchColumns as any);
      if (error) {
        // Ignore duplicate key errors (already exists)
        if (error.code === '23505') return ok(true);
        throw new Error(error.message);
      }
    } else {
      let query = supabase.from(table as any).delete();
      for (const [col, val] of Object.entries(matchColumns)) {
        query = query.eq(col, val);
      }
      const { error } = await query;
      if (error) throw new Error(error.message);
    }

    invalidateCache(table);
    return ok(shouldExist);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return err(message);
  }
}

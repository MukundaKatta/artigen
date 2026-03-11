import {
  getCached,
  setCached,
  invalidateCache,
  deduplicatedFetch,
  cacheKey,
} from '@/lib/api-cache';

describe('api-cache', () => {
  beforeEach(() => {
    invalidateCache(); // Clear cache between tests
  });

  describe('getCached / setCached', () => {
    it('returns undefined for missing keys', () => {
      expect(getCached('nonexistent')).toBeUndefined();
    });

    it('stores and retrieves values', () => {
      setCached('test-key', { id: 1, name: 'Test' });
      expect(getCached('test-key')).toEqual({ id: 1, name: 'Test' });
    });

    it('returns undefined for expired entries', async () => {
      setCached('expired-key', 'value', 1); // 1ms TTL
      // Wait for TTL to expire
      await new Promise((r) => setTimeout(r, 10));
      expect(getCached('expired-key')).toBeUndefined();
    });

    it('respects custom TTL', () => {
      setCached('ttl-key', 'value', 60_000); // 60s TTL
      expect(getCached('ttl-key')).toBe('value');
    });
  });

  describe('invalidateCache', () => {
    it('clears all entries when called without pattern', () => {
      setCached('a', 1);
      setCached('b', 2);
      invalidateCache();
      expect(getCached('a')).toBeUndefined();
      expect(getCached('b')).toBeUndefined();
    });

    it('clears only matching entries with pattern', () => {
      setCached('posts:feed', [1, 2]);
      setCached('posts:single', { id: 1 });
      setCached('users:profile', { name: 'Test' });
      invalidateCache('posts');
      expect(getCached('posts:feed')).toBeUndefined();
      expect(getCached('posts:single')).toBeUndefined();
      expect(getCached('users:profile')).toEqual({ name: 'Test' });
    });
  });

  describe('cacheKey', () => {
    it('creates keys from parts', () => {
      expect(cacheKey('posts', 'feed', '123')).toBe('posts:feed:123');
    });

    it('filters out undefined parts', () => {
      expect(cacheKey('posts', undefined, '123')).toBe('posts:123');
    });
  });

  describe('deduplicatedFetch', () => {
    it('returns cached value if available', async () => {
      setCached('dedup-key', 'cached-value', 60_000);
      const fetcher = jest.fn();
      const result = await deduplicatedFetch('dedup-key', fetcher);
      expect(result).toBe('cached-value');
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('calls fetcher and caches result', async () => {
      const fetcher = jest.fn().mockResolvedValue('fresh-value');
      const result = await deduplicatedFetch('fresh-key', fetcher);
      expect(result).toBe('fresh-value');
      expect(getCached('fresh-key')).toBe('fresh-value');
    });

    it('deduplicates concurrent requests', async () => {
      let resolvePromise: (value: string) => void;
      const fetcher = jest.fn().mockReturnValue(
        new Promise<string>((resolve) => {
          resolvePromise = resolve;
        }),
      );

      const promise1 = deduplicatedFetch('concurrent-key', fetcher);
      const promise2 = deduplicatedFetch('concurrent-key', fetcher);

      // Only one fetch should have been made
      expect(fetcher).toHaveBeenCalledTimes(1);

      resolvePromise!('shared-result');

      const [result1, result2] = await Promise.all([promise1, promise2]);
      expect(result1).toBe('shared-result');
      expect(result2).toBe('shared-result');
    });

    it('does not cache failed fetches', async () => {
      const fetcher = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(deduplicatedFetch('fail-key', fetcher)).rejects.toThrow('Network error');
      expect(getCached('fail-key')).toBeUndefined();
    });
  });
});

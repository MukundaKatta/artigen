// Mock react-native and supabase to avoid ESM import issues
jest.mock('react-native', () => ({
  AppState: { addEventListener: jest.fn() },
  Platform: { OS: 'web', select: jest.fn((obj: any) => obj.default || {}) },
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: { startAutoRefresh: jest.fn() },
  },
}));

jest.mock('@/lib/storage', () => ({
  storage: {},
}));

import { ok, err, paginated, paginatedError, batchQuery } from '@/lib/service-helpers';

describe('service-helpers', () => {
  describe('ok', () => {
    it('wraps data with null error', () => {
      const result = ok({ id: 1 });
      expect(result.data).toEqual({ id: 1 });
      expect(result.error).toBeNull();
    });
  });

  describe('err', () => {
    it('wraps error message with null data', () => {
      const result = err('Something failed');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Something failed');
    });
  });

  describe('paginated', () => {
    it('returns hasMore true when data length equals page size', () => {
      const items = Array.from({ length: 20 }, (_, i) => ({ id: i }));
      const result = paginated(items, 20);
      expect(result.data).toHaveLength(20);
      expect(result.hasMore).toBe(true);
      expect(result.error).toBeNull();
    });

    it('returns hasMore false when data is less than page size', () => {
      const items = [{ id: 1 }, { id: 2 }];
      const result = paginated(items, 20);
      expect(result.hasMore).toBe(false);
    });

    it('returns empty data array', () => {
      const result = paginated([], 20);
      expect(result.data).toHaveLength(0);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('paginatedError', () => {
    it('returns empty data with error', () => {
      const result = paginatedError();
      expect(result.data).toHaveLength(0);
      expect(result.hasMore).toBe(false);
      expect(result.error).toBe('Failed to load data');
    });
  });

  describe('batchQuery', () => {
    it('processes all items', async () => {
      const items = [1, 2, 3, 4, 5];
      const results = await batchQuery(items, async (n) => n * 2);
      expect(results).toEqual([2, 4, 6, 8, 10]);
    });

    it('respects concurrency limit', async () => {
      let concurrent = 0;
      let maxConcurrent = 0;
      const items = [1, 2, 3, 4, 5, 6, 7, 8];
      await batchQuery(
        items,
        async (n) => {
          concurrent++;
          maxConcurrent = Math.max(maxConcurrent, concurrent);
          await new Promise((r) => setTimeout(r, 1));
          concurrent--;
          return n;
        },
        3,
      );
      expect(maxConcurrent).toBeLessThanOrEqual(3);
    });
  });
});

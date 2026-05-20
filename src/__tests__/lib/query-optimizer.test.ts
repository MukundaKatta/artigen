import { batchCheckRelation } from '@/lib/query-optimizer';
import { supabase } from '@/lib/supabase';

const mockedFrom = supabase.from as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('batchCheckRelation', () => {
  it('returns an empty Set when there are no IDs to check', async () => {
    const result = await batchCheckRelation('likes', 'user-1', 'post_id', []);
    expect(result).toEqual(new Set());
    expect(mockedFrom).not.toHaveBeenCalled();
  });

  it('builds a single .from().select().eq().in() chain that resolves to a Set of related ids', async () => {
    const rows = [{ post_id: 'p1' }, { post_id: 'p2' }, { post_id: 'p3' }];

    // Build a one-off query-builder that resolves with rows on await
    const builder: Record<string, jest.Mock> = {};
    ['select', 'eq', 'in'].forEach((m) => {
      builder[m] = jest.fn().mockReturnValue(builder);
    });
    builder.then = jest.fn((resolve) => resolve({ data: rows, error: null }));

    mockedFrom.mockReturnValueOnce(builder);

    const result = await batchCheckRelation('likes', 'user-1', 'post_id', ['p1', 'p2', 'p3']);

    expect(mockedFrom).toHaveBeenCalledWith('likes');
    expect(builder.select).toHaveBeenCalledWith('post_id');
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(builder.in).toHaveBeenCalledWith('post_id', ['p1', 'p2', 'p3']);
    expect(result).toEqual(new Set(['p1', 'p2', 'p3']));
  });

  it('returns an empty Set when data is null / error path', async () => {
    const builder: Record<string, jest.Mock> = {};
    ['select', 'eq', 'in'].forEach((m) => {
      builder[m] = jest.fn().mockReturnValue(builder);
    });
    builder.then = jest.fn((resolve) =>
      resolve({ data: null, error: { message: 'fail' } }),
    );

    mockedFrom.mockReturnValueOnce(builder);

    // Use a fresh table / IDs combo so the api-cache key differs from any
    // earlier test and we hit the network path
    const result = await batchCheckRelation('saved_posts', 'user-fresh', 'post_id', ['x']);
    expect(result).toEqual(new Set());
  });
});

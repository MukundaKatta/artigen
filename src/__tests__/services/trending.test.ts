import { supabase } from '@/lib/supabase';
import { getTrendingPrompts, getTrendingStyles } from '@/services/trending.service';

function chain(resolved: unknown) {
  const c: Record<string, jest.Mock> = {};
  for (const m of ['select', 'order', 'limit', 'eq']) {
    c[m] = jest.fn().mockReturnValue(c);
  }
  c.then = jest.fn((resolve) => resolve(resolved));
  return c;
}

beforeEach(() => jest.clearAllMocks());

describe('getTrendingPrompts', () => {
  it('queries the trending_prompts table with default limit 20', async () => {
    const c = chain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getTrendingPrompts();

    expect(supabase.from).toHaveBeenCalledWith('trending_prompts');
    expect(c.limit).toHaveBeenCalledWith(20);
  });

  it('orders by use_count then total_likes desc', async () => {
    const c = chain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getTrendingPrompts();

    expect(c.order).toHaveBeenCalledWith('use_count', { ascending: false });
    expect(c.order).toHaveBeenCalledWith('total_likes', { ascending: false });
  });

  it('respects a custom limit', async () => {
    const c = chain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getTrendingPrompts(5);

    expect(c.limit).toHaveBeenCalledWith(5);
  });
});

describe('getTrendingStyles', () => {
  it('queries trending_styles with default limit 20', async () => {
    const c = chain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getTrendingStyles();

    expect(supabase.from).toHaveBeenCalledWith('trending_styles');
    expect(c.limit).toHaveBeenCalledWith(20);
  });

  it('orders by post_count then total_likes desc', async () => {
    const c = chain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getTrendingStyles();

    expect(c.order).toHaveBeenCalledWith('post_count', { ascending: false });
  });
});

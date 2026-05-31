import { supabase } from '@/lib/supabase';
import {
  submitCritique,
  getCritiques,
  markHelpful,
  unmarkHelpful,
  getCritiqueCount,
} from '@/services/critique.service';

function chain(resolved: unknown) {
  const c: Record<string, jest.Mock> = {};
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'order', 'limit', 'in', 'range']) {
    c[m] = jest.fn().mockReturnValue(c);
  }
  c.single = jest.fn().mockResolvedValue(resolved);
  c.maybeSingle = jest.fn().mockResolvedValue(resolved);
  c.then = jest.fn((resolve) => resolve(resolved));
  return c;
}

beforeEach(() => jest.clearAllMocks());

describe('submitCritique', () => {
  it('inserts a critique row with ratings + feedback_text', async () => {
    const c = chain({ data: { id: 'cr-1' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);
    const ratings = { composition: 4, color: 5, originality: 3, technical: 4, concept: 5 };

    await submitCritique('post-1', 'user-1', ratings, 'Great work');

    expect(supabase.from).toHaveBeenCalledWith('post_critiques');
    expect(c.insert).toHaveBeenCalledWith(expect.objectContaining({
      post_id: 'post-1',
      user_id: 'user-1',
      feedback_text: 'Great work',
      composition: 4,
      color: 5,
    }));
  });
});

describe('getCritiques', () => {
  it('filters by post_id and paginates 20 per page', async () => {
    const c = chain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getCritiques('post-1', 1);

    expect(c.eq).toHaveBeenCalledWith('post_id', 'post-1');
    expect(c.range).toHaveBeenCalledWith(20, 39);
  });
});

describe('markHelpful / unmarkHelpful', () => {
  it('markHelpful inserts a helpful_votes row', async () => {
    const c = chain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await markHelpful('cr-1', 'user-2');

    expect((supabase.from as jest.Mock).mock.calls[0][0]).toBe('critique_helpful_votes');
    expect(c.insert).toHaveBeenCalledWith({ critique_id: 'cr-1', user_id: 'user-2' });
  });

  it('unmarkHelpful deletes by critique + user', async () => {
    const c = chain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await unmarkHelpful('cr-1', 'user-2');

    expect(c.delete).toHaveBeenCalled();
    expect(c.eq).toHaveBeenCalledWith('critique_id', 'cr-1');
    expect(c.eq).toHaveBeenCalledWith('user_id', 'user-2');
  });
});

describe('getCritiqueCount', () => {
  it('returns 0 when post has no critiques', async () => {
    const c = chain({ data: null, error: null, count: 0 });
    (supabase.from as jest.Mock).mockReturnValue(c);
    c.then = jest.fn((resolve) => resolve({ count: 0, error: null }));

    const count = await getCritiqueCount('post-1');

    expect(count).toBe(0);
  });
});

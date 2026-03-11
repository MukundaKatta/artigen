import { supabase } from '@/lib/supabase';
import { likeComment, unlikeComment, checkLikedComments } from '@/services/comment-like.service';

function mockQueryChain(resolvedValue: any) {
  const chain: Record<string, jest.Mock> = {};
  const methods = [
    'select', 'insert', 'update', 'delete',
    'eq', 'neq', 'in', 'is', 'order', 'range', 'limit',
  ];
  for (const m of methods) {
    chain[m] = jest.fn().mockReturnValue(chain);
  }
  chain.single = jest.fn().mockResolvedValue(resolvedValue);
  chain.maybeSingle = jest.fn().mockResolvedValue(resolvedValue);
  chain.then = jest.fn((resolve) => resolve(resolvedValue));
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('likeComment', () => {
  it('inserts a comment_likes record', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { error } = await likeComment('user-1', 'comment-1');

    expect(supabase.from).toHaveBeenCalledWith('comment_likes');
    expect(chain.insert).toHaveBeenCalledWith({ user_id: 'user-1', comment_id: 'comment-1' });
    expect(error).toBeNull();
  });
});

describe('unlikeComment', () => {
  it('deletes the comment like record', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { error } = await unlikeComment('user-1', 'comment-1');

    expect(supabase.from).toHaveBeenCalledWith('comment_likes');
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(chain.eq).toHaveBeenCalledWith('comment_id', 'comment-1');
    expect(error).toBeNull();
  });
});

describe('checkLikedComments', () => {
  it('returns empty set for empty input', async () => {
    const result = await checkLikedComments('user-1', []);

    expect(result.size).toBe(0);
  });

  it('returns set of liked comment IDs', async () => {
    const chain = mockQueryChain({
      data: [{ comment_id: 'c1' }, { comment_id: 'c3' }],
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await checkLikedComments('user-1', ['c1', 'c2', 'c3']);

    expect(result.has('c1')).toBe(true);
    expect(result.has('c2')).toBe(false);
    expect(result.has('c3')).toBe(true);
    expect(chain.in).toHaveBeenCalledWith('comment_id', ['c1', 'c2', 'c3']);
  });
});

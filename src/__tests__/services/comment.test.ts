import { supabase } from '@/lib/supabase';
import { getComments, getReplies, getReplyCount, addComment, deleteComment } from '@/services/comment.service';

function mockQueryChain(resolvedValue: any) {
  const chain: Record<string, jest.Mock> = {};
  const methods = [
    'select', 'insert', 'update', 'delete',
    'eq', 'neq', 'in', 'is', 'order', 'range', 'limit', 'filter',
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

describe('getComments', () => {
  it('fetches top-level comments for a post with pagination', async () => {
    const mockComments = [
      { id: 'c1', content: 'Great!', user: { id: 'u1', username: 'alice' } },
    ];
    const chain = mockQueryChain({ data: mockComments, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await getComments('post-1', 0);

    expect(supabase.from).toHaveBeenCalledWith('comments');
    expect(chain.select).toHaveBeenCalledWith('*, user:profiles!user_id(*)');
    expect(chain.eq).toHaveBeenCalledWith('post_id', 'post-1');
    expect(chain.is).toHaveBeenCalledWith('parent_comment_id', null);
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: true });
    expect(chain.range).toHaveBeenCalledWith(0, 19);
    expect(result.data).toEqual(mockComments);
  });

  it('returns empty array when no comments exist', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await getComments('post-1');

    expect(result.data).toEqual([]);
  });

  it('supports pagination', async () => {
    const chain = mockQueryChain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    await getComments('post-1', 2);

    expect(chain.range).toHaveBeenCalledWith(40, 59);
  });
});

describe('getReplies', () => {
  it('fetches replies for a comment', async () => {
    const mockReplies = [
      { id: 'r1', content: 'Thanks!', user: { id: 'u2' } },
    ];
    const chain = mockQueryChain({ data: mockReplies, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await getReplies('comment-1');

    expect(chain.eq).toHaveBeenCalledWith('parent_comment_id', 'comment-1');
    expect(result.data).toEqual(mockReplies);
  });
});

describe('getReplyCount', () => {
  it('returns empty map for empty input', async () => {
    const result = await getReplyCount([]);

    expect(result.size).toBe(0);
  });

  it('counts replies per comment', async () => {
    const chain = mockQueryChain({
      data: [
        { parent_comment_id: 'c1' },
        { parent_comment_id: 'c1' },
        { parent_comment_id: 'c2' },
      ],
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await getReplyCount(['c1', 'c2']);

    expect(result.get('c1')).toBe(2);
    expect(result.get('c2')).toBe(1);
  });
});

describe('addComment', () => {
  it('inserts a comment and returns it with user data', async () => {
    const mockComment = { id: 'c1', content: 'Nice!', user: { id: 'u1' } };
    const chain = mockQueryChain({ data: mockComment, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await addComment('u1', 'post-1', 'Nice!');

    expect(chain.insert).toHaveBeenCalledWith({
      user_id: 'u1',
      post_id: 'post-1',
      content: 'Nice!',
      parent_comment_id: null,
    });
    expect(result.data).toEqual(mockComment);
  });

  it('inserts a reply with parent_comment_id', async () => {
    const chain = mockQueryChain({ data: { id: 'r1' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    await addComment('u1', 'post-1', 'Reply!', 'parent-c1');

    expect(chain.insert).toHaveBeenCalledWith({
      user_id: 'u1',
      post_id: 'post-1',
      content: 'Reply!',
      parent_comment_id: 'parent-c1',
    });
  });

  it('returns error when insert fails', async () => {
    const chain = mockQueryChain({ data: null, error: { message: 'Failed' } });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await addComment('u1', 'post-1', 'test');

    expect(result.error).toEqual({ message: 'Failed' });
  });
});

describe('deleteComment', () => {
  it('deletes a comment by id', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { error } = await deleteComment('c1');

    expect(supabase.from).toHaveBeenCalledWith('comments');
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('id', 'c1');
    expect(error).toBeNull();
  });
});

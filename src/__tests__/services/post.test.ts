import { supabase } from '@/lib/supabase';
import { getFeed, deletePost, likePost, unlikePost, savePost, unsavePost, pinPost, unpinPost } from '@/services/post.service';

// supabase is auto-mocked via moduleNameMapper

// Helper: build a chainable query builder that resolves to the given value
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
  // Allow direct await
  chain.then = jest.fn((resolve) => resolve(resolvedValue));
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getFeed', () => {
  it('returns empty array when follows query returns no data', async () => {
    // First call: follows query
    const followsChain = mockQueryChain({ data: [], error: null });
    // Second call: posts query
    const postsChain = mockQueryChain({ data: [], error: null });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return followsChain;
      return postsChain;
    });

    const result = await getFeed('user-1', 0);

    expect(result.data).toEqual([]);
  });

  it('calls supabase.from with follows and posts tables', async () => {
    const followsChain = mockQueryChain({ data: [{ following_id: 'user-2' }], error: null });
    const postsChain = mockQueryChain({ data: [], error: null });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return followsChain;
      return postsChain;
    });

    await getFeed('user-1', 0);

    expect(supabase.from).toHaveBeenCalledWith('follows');
  });

  it('returns error when posts query fails', async () => {
    const followsChain = mockQueryChain({ data: [], error: null });
    const postsChain = mockQueryChain({ data: null, error: { message: 'DB error' } });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return followsChain;
      return postsChain;
    });

    const result = await getFeed('user-1', 0);

    expect(result.data).toEqual([]);
    expect(result.error).toEqual({ message: 'DB error' });
  });

  it('includes current user posts in feed (self + following)', async () => {
    const followsChain = mockQueryChain({ data: [{ following_id: 'user-2' }], error: null });

    const mockPosts = [
      { id: 'post-1', user_id: 'user-1', media: [], ai_metadata: [], user: { id: 'user-1' } },
    ];
    const postsChain = mockQueryChain({ data: mockPosts, error: null });
    const likesChain = mockQueryChain({ data: [], error: null });
    const savesChain = mockQueryChain({ data: [], error: null });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return followsChain;
      if (callCount === 2) return postsChain;
      if (callCount === 3) return likesChain;
      return savesChain;
    });

    const result = await getFeed('user-1', 0);

    expect(result.data.length).toBe(1);
    expect(result.data[0].id).toBe('post-1');
    expect(result.data[0].isLiked).toBe(false);
    expect(result.data[0].isSaved).toBe(false);
  });

  it('marks posts as liked and saved when user has interacted', async () => {
    const followsChain = mockQueryChain({ data: [], error: null });

    const mockPosts = [
      { id: 'post-1', user_id: 'user-1', media: [], ai_metadata: [], user: { id: 'user-1' } },
      { id: 'post-2', user_id: 'user-1', media: [], ai_metadata: [], user: { id: 'user-1' } },
    ];
    const postsChain = mockQueryChain({ data: mockPosts, error: null });
    const likesChain = mockQueryChain({ data: [{ post_id: 'post-1' }], error: null });
    const savesChain = mockQueryChain({ data: [{ post_id: 'post-2' }], error: null });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return followsChain;
      if (callCount === 2) return postsChain;
      if (callCount === 3) return likesChain;
      return savesChain;
    });

    const result = await getFeed('user-1', 0);

    expect(result.data[0].isLiked).toBe(true);
    expect(result.data[0].isSaved).toBe(false);
    expect(result.data[1].isLiked).toBe(false);
    expect(result.data[1].isSaved).toBe(true);
  });
});

describe('deletePost', () => {
  it('calls supabase.from(posts).delete().eq(id, postId)', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { error } = await deletePost('post-1');

    expect(supabase.from).toHaveBeenCalledWith('posts');
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('id', 'post-1');
    expect(error).toBeNull();
  });

  it('returns error when delete fails', async () => {
    const chain = mockQueryChain({ data: null, error: { message: 'Not found' } });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { error } = await deletePost('nonexistent');

    expect(error).toEqual({ message: 'Not found' });
  });
});

describe('likePost', () => {
  it('inserts a like record for the user and post', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { error } = await likePost('user-1', 'post-1');

    expect(supabase.from).toHaveBeenCalledWith('likes');
    expect(chain.insert).toHaveBeenCalledWith({ user_id: 'user-1', post_id: 'post-1' });
    expect(error).toBeNull();
  });
});

describe('unlikePost', () => {
  it('deletes the like record matching user and post', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { error } = await unlikePost('user-1', 'post-1');

    expect(supabase.from).toHaveBeenCalledWith('likes');
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(chain.eq).toHaveBeenCalledWith('post_id', 'post-1');
    expect(error).toBeNull();
  });
});

describe('savePost', () => {
  it('inserts a saved_posts record', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { error } = await savePost('user-1', 'post-1');

    expect(supabase.from).toHaveBeenCalledWith('saved_posts');
    expect(chain.insert).toHaveBeenCalledWith({ user_id: 'user-1', post_id: 'post-1' });
    expect(error).toBeNull();
  });
});

describe('unsavePost', () => {
  it('deletes the saved_posts record matching user and post', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { error } = await unsavePost('user-1', 'post-1');

    expect(supabase.from).toHaveBeenCalledWith('saved_posts');
    expect(chain.delete).toHaveBeenCalled();
    expect(error).toBeNull();
  });
});

describe('pinPost', () => {
  it('returns error when user already has 3 pinned posts', async () => {
    const countChain = mockQueryChain({ data: null, error: null, count: 3 });
    (supabase.from as jest.Mock).mockReturnValue(countChain);

    const result = await pinPost('post-1', 'user-1');

    expect(result.error).toEqual({ message: 'You can only pin up to 3 posts' });
  });

  it('updates post to pinned when under limit', async () => {
    const countChain = mockQueryChain({ data: null, error: null, count: 1 });
    const updateChain = mockQueryChain({ data: null, error: null });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return countChain;
      return updateChain;
    });

    const result = await pinPost('post-1', 'user-1');

    expect(result.error).toBeNull();
  });
});

describe('unpinPost', () => {
  it('updates post to unpinned', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { error } = await unpinPost('post-1');

    expect(supabase.from).toHaveBeenCalledWith('posts');
    expect(chain.update).toHaveBeenCalledWith({ is_pinned: false, pinned_at: null });
    expect(chain.eq).toHaveBeenCalledWith('id', 'post-1');
    expect(error).toBeNull();
  });
});

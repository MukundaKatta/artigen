import { supabase } from '@/lib/supabase';
import { followUser, unfollowUser, checkIsFollowing, getFollowers, getFollowing } from '@/services/follow.service';

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

describe('followUser', () => {
  it('inserts a follow record', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { error } = await followUser('user-1', 'user-2');

    expect(supabase.from).toHaveBeenCalledWith('follows');
    expect(chain.insert).toHaveBeenCalledWith({
      follower_id: 'user-1',
      following_id: 'user-2',
    });
    expect(error).toBeNull();
  });

  it('returns error on failure', async () => {
    const chain = mockQueryChain({ data: null, error: { message: 'Duplicate' } });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { error } = await followUser('user-1', 'user-2');

    expect(error).toEqual({ message: 'Duplicate' });
  });
});

describe('unfollowUser', () => {
  it('deletes the follow record', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { error } = await unfollowUser('user-1', 'user-2');

    expect(supabase.from).toHaveBeenCalledWith('follows');
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('follower_id', 'user-1');
    expect(chain.eq).toHaveBeenCalledWith('following_id', 'user-2');
    expect(error).toBeNull();
  });
});

describe('checkIsFollowing', () => {
  it('returns true when following', async () => {
    const chain = mockQueryChain({ data: { id: 'follow-1' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await checkIsFollowing('user-1', 'user-2');

    expect(result.isFollowing).toBe(true);
  });

  it('returns false when not following', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await checkIsFollowing('user-1', 'user-2');

    expect(result.isFollowing).toBe(false);
  });
});

describe('getFollowers', () => {
  it('fetches followers with pagination', async () => {
    const mockFollowers = [
      { follower_id: 'f1', profiles: { id: 'f1', username: 'alice' } },
    ];
    const chain = mockQueryChain({ data: mockFollowers, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await getFollowers('user-1', 0);

    expect(chain.eq).toHaveBeenCalledWith('following_id', 'user-1');
    expect(chain.eq).toHaveBeenCalledWith('status', 'accepted');
    expect(chain.range).toHaveBeenCalledWith(0, 19);
    expect(result.data).toEqual(mockFollowers);
  });

  it('supports page 2', async () => {
    const chain = mockQueryChain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    await getFollowers('user-1', 2);

    expect(chain.range).toHaveBeenCalledWith(40, 59);
  });
});

describe('getFollowing', () => {
  it('fetches following with pagination', async () => {
    const chain = mockQueryChain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    await getFollowing('user-1', 1);

    expect(chain.eq).toHaveBeenCalledWith('follower_id', 'user-1');
    expect(chain.range).toHaveBeenCalledWith(20, 39);
  });
});

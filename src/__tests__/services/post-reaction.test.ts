import { supabase } from '@/lib/supabase';
import {
  getPostReactions,
  getUserReaction,
  setReaction,
  removeReaction,
  REACTION_EMOJIS,
  REACTION_TYPES,
} from '@/services/post-reaction.service';

function mockQueryChain(resolvedValue: any) {
  const chain: Record<string, jest.Mock> = {};
  const methods = [
    'select', 'insert', 'upsert', 'update', 'delete',
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

describe('REACTION_EMOJIS and REACTION_TYPES', () => {
  it('has all 7 reaction types', () => {
    expect(REACTION_TYPES).toHaveLength(7);
    expect(REACTION_TYPES).toContain('like');
    expect(REACTION_TYPES).toContain('love');
    expect(REACTION_TYPES).toContain('fire');
  });

  it('has emoji for every reaction type', () => {
    for (const type of REACTION_TYPES) {
      expect(REACTION_EMOJIS[type]).toBeDefined();
      expect(typeof REACTION_EMOJIS[type]).toBe('string');
    }
  });
});

describe('getPostReactions', () => {
  it('aggregates reactions into a sorted summary', async () => {
    const chain = mockQueryChain({
      data: [
        { reaction_type: 'like' },
        { reaction_type: 'love' },
        { reaction_type: 'like' },
        { reaction_type: 'fire' },
        { reaction_type: 'like' },
      ],
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await getPostReactions('post-1');

    expect(result.data).toHaveLength(3);
    // Sorted by count descending: like (3), then love (1) or fire (1)
    expect(result.data[0]).toEqual({ type: 'like', count: 3 });
    expect(result.data[1].count).toBe(1);
  });

  it('returns empty array on error', async () => {
    const chain = mockQueryChain({ data: null, error: { message: 'fail' } });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await getPostReactions('post-1');

    expect(result.data).toEqual([]);
  });
});

describe('getUserReaction', () => {
  it('returns the user reaction type', async () => {
    const chain = mockQueryChain({ data: { reaction_type: 'love' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await getUserReaction('user-1', 'post-1');

    expect(result.data).toBe('love');
  });

  it('returns null when no reaction', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await getUserReaction('user-1', 'post-1');

    expect(result.data).toBeFalsy();
  });
});

describe('setReaction', () => {
  it('upserts a reaction for the user', async () => {
    const chain = mockQueryChain({ data: { user_id: 'u1', post_id: 'p1', reaction_type: 'fire' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await setReaction('u1', 'p1', 'fire');

    expect(supabase.from).toHaveBeenCalledWith('post_reactions');
    expect(chain.upsert).toHaveBeenCalledWith(
      { user_id: 'u1', post_id: 'p1', reaction_type: 'fire' },
      { onConflict: 'user_id,post_id' },
    );
    expect(result.error).toBeNull();
  });
});

describe('removeReaction', () => {
  it('deletes the user reaction', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { error } = await removeReaction('u1', 'p1');

    expect(supabase.from).toHaveBeenCalledWith('post_reactions');
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'u1');
    expect(chain.eq).toHaveBeenCalledWith('post_id', 'p1');
    expect(error).toBeNull();
  });
});

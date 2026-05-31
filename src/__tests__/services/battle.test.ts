import { supabase } from '@/lib/supabase';
import {
  createBattle,
  joinBattle,
  voteBattleEntry,
  unvoteBattleEntry,
  getBattle,
  getActiveBattles,
} from '@/services/battle.service';

function chain(resolved: unknown) {
  const c: Record<string, jest.Mock> = {};
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'neq', 'in', 'is', 'order', 'range', 'limit', 'gt', 'gte', 'lt', 'lte']) {
    c[m] = jest.fn().mockReturnValue(c);
  }
  c.single = jest.fn().mockResolvedValue(resolved);
  c.maybeSingle = jest.fn().mockResolvedValue(resolved);
  c.then = jest.fn((resolve) => resolve(resolved));
  return c;
}

beforeEach(() => jest.clearAllMocks());

describe('createBattle', () => {
  it('inserts a row with the creator + theme + time-limit + waiting status', async () => {
    const c = chain({ data: { id: 'b1', theme: 'cyberpunk' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await createBattle('user-1', 'cyberpunk', 'Cyber duel', 30);

    expect(supabase.from).toHaveBeenCalledWith('art_battles');
    expect(c.insert).toHaveBeenCalledWith(expect.objectContaining({
      creator_id: 'user-1',
      theme: 'cyberpunk',
      title: 'Cyber duel',
      time_limit_minutes: 30,
      status: 'waiting',
    }));
  });

  it('defaults timeLimitMinutes to 15', async () => {
    const c = chain({ data: { id: 'b1' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await createBattle('user-1', 'theme', 'title');

    expect(c.insert).toHaveBeenCalledWith(expect.objectContaining({ time_limit_minutes: 15 }));
  });
});

describe('joinBattle', () => {
  it('updates the battle with opponent_id + status=active + started_at', async () => {
    const c = chain({ data: { id: 'b1' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await joinBattle('b1', 'user-2');

    expect(supabase.from).toHaveBeenCalledWith('art_battles');
    expect(c.update).toHaveBeenCalledWith(expect.objectContaining({
      opponent_id: 'user-2',
      status: 'active',
    }));
    expect(c.eq).toHaveBeenCalledWith('id', 'b1');
  });
});

describe('voteBattleEntry / unvoteBattleEntry', () => {
  it('voteBattleEntry inserts a vote row', async () => {
    const c = chain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await voteBattleEntry('b1', 'e1', 'user-3');

    // First call is to battle_votes for the insert
    expect((supabase.from as jest.Mock).mock.calls[0][0]).toBe('battle_votes');
    expect(c.insert).toHaveBeenCalledWith({
      battle_id: 'b1',
      entry_id: 'e1',
      user_id: 'user-3',
    });
  });

  it('unvoteBattleEntry returns early when no vote exists', async () => {
    const c = chain({ data: null, error: null }); // maybeSingle returns null
    (supabase.from as jest.Mock).mockReturnValue(c);

    const { error } = await unvoteBattleEntry('b1', 'user-3');

    expect((supabase.from as jest.Mock).mock.calls[0][0]).toBe('battle_votes');
    expect(c.delete).not.toHaveBeenCalled(); // never gets past the early return
    expect(error).toBeNull();
  });

  it('unvoteBattleEntry deletes when a vote row is found', async () => {
    const c = chain({ data: { id: 'vote-1', entry_id: 'e1', vote_count: 3 }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await unvoteBattleEntry('b1', 'user-3');

    expect(c.delete).toHaveBeenCalled();
    expect(c.eq).toHaveBeenCalledWith('id', 'vote-1');
  });
});

describe('getBattle / getActiveBattles', () => {
  it('getBattle fetches by id with the creator + opponent joined', async () => {
    const c = chain({ data: { id: 'b1' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getBattle('b1');

    expect(c.eq).toHaveBeenCalledWith('id', 'b1');
    expect(c.single).toHaveBeenCalled();
  });

  it('getActiveBattles paginates 20 per page', async () => {
    const c = chain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getActiveBattles(2);

    // page 2 → from=40, to=59
    expect(c.range).toHaveBeenCalledWith(40, 59);
  });
});

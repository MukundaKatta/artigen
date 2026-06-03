import { supabase } from '@/lib/supabase';
import {
  getActiveWeeklyEvent,
  getWeeklyEvents,
  submitWeeklyEntry,
  voteWeeklyEntry,
  unvoteWeeklyEntry,
  getUserVotedWeeklyEntryIds,
} from '@/services/weekly-event.service';

function chain(resolved: unknown) {
  const c: Record<string, jest.Mock> = {};
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'order', 'limit', 'in', 'gt', 'is', 'not']) {
    c[m] = jest.fn().mockReturnValue(c);
  }
  c.single = jest.fn().mockResolvedValue(resolved);
  c.maybeSingle = jest.fn().mockResolvedValue(resolved);
  c.then = jest.fn((resolve) => resolve(resolved));
  return c;
}

beforeEach(() => jest.clearAllMocks());

describe('getActiveWeeklyEvent', () => {
  it('filters for is_active=true, orders by starts_at desc, takes 1', async () => {
    const c = chain({ data: { id: 'we-1' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getActiveWeeklyEvent();

    expect(c.eq).toHaveBeenCalledWith('is_active', true);
    expect(c.order).toHaveBeenCalledWith('starts_at', { ascending: false });
    expect(c.limit).toHaveBeenCalledWith(1);
    expect(c.maybeSingle).toHaveBeenCalled();
  });
});

describe('getWeeklyEvents', () => {
  it('orders by starts_at desc', async () => {
    const c = chain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getWeeklyEvents();

    expect(supabase.from).toHaveBeenCalledWith('weekly_events');
    expect(c.order).toHaveBeenCalledWith('starts_at', { ascending: false });
  });
});

describe('submitWeeklyEntry', () => {
  it('inserts into weekly_event_entries with event/user/post ids', async () => {
    const c = chain({ data: { id: 'e-1' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await submitWeeklyEntry('we-1', 'user-1', 'post-1');

    expect(c.insert).toHaveBeenCalledWith({
      event_id: 'we-1',
      user_id: 'user-1',
      post_id: 'post-1',
    });
  });
});

describe('voteWeeklyEntry / unvoteWeeklyEntry', () => {
  it('voteWeeklyEntry inserts a vote row', async () => {
    const c = chain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await voteWeeklyEntry('e-1', 'user-1');

    expect((supabase.from as jest.Mock).mock.calls[0][0]).toBe('weekly_event_votes');
    expect(c.insert).toHaveBeenCalledWith({ entry_id: 'e-1', user_id: 'user-1' });
  });

  it('unvoteWeeklyEntry deletes the vote', async () => {
    const c = chain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await unvoteWeeklyEntry('e-1', 'user-1');

    expect(c.delete).toHaveBeenCalled();
    expect(c.eq).toHaveBeenCalledWith('entry_id', 'e-1');
    expect(c.eq).toHaveBeenCalledWith('user_id', 'user-1');
  });
});

describe('getUserVotedWeeklyEntryIds', () => {
  it('returns empty Set when no entry ids are passed', async () => {
    const result = await getUserVotedWeeklyEntryIds([], 'user-1');
    expect(result).toEqual(new Set());
  });

  it('returns a Set of entry_ids from the rows', async () => {
    const c = chain({ data: [{ entry_id: 'e-1' }, { entry_id: 'e-2' }], error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    const result = await getUserVotedWeeklyEntryIds(['e-1', 'e-2'], 'user-1');

    expect(result).toEqual(new Set(['e-1', 'e-2']));
  });
});

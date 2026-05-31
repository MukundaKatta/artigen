import { supabase } from '@/lib/supabase';
import {
  getExhibitions,
  getExhibition,
  createExhibition,
  submitToExhibition,
  curateSubmission,
  getSubmissions,
} from '@/services/exhibition.service';

function chain(resolved: unknown) {
  const c: Record<string, jest.Mock> = {};
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'neq', 'in', 'is', 'order', 'range', 'limit', 'gt', 'upsert']) {
    c[m] = jest.fn().mockReturnValue(c);
  }
  c.single = jest.fn().mockResolvedValue(resolved);
  c.maybeSingle = jest.fn().mockResolvedValue(resolved);
  c.then = jest.fn((resolve) => resolve(resolved));
  return c;
}

beforeEach(() => jest.clearAllMocks());

describe('getExhibitions', () => {
  it('returns all when no status filter', async () => {
    const c = chain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getExhibitions();

    expect(supabase.from).toHaveBeenCalledWith('exhibitions');
    // No .eq('status', ...) call expected
    expect(c.eq).not.toHaveBeenCalledWith('status', expect.anything());
  });

  it('filters by status when provided', async () => {
    const c = chain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getExhibitions('live');

    expect(c.eq).toHaveBeenCalledWith('status', 'live');
  });
});

describe('getExhibition', () => {
  it('fetches a single row by id', async () => {
    const c = chain({ data: { id: 'ex-1' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getExhibition('ex-1');

    expect(c.eq).toHaveBeenCalledWith('id', 'ex-1');
    expect(c.single).toHaveBeenCalled();
  });
});

describe('createExhibition', () => {
  it('inserts with the curator + title + theme', async () => {
    const c = chain({ data: { id: 'ex-1' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await createExhibition('user-1', 'Spring Show', 'desc', 'spring');

    expect(c.insert).toHaveBeenCalledWith(expect.objectContaining({
      curator_id: 'user-1',
      title: 'Spring Show',
      theme: 'spring',
    }));
  });
});

describe('submitToExhibition', () => {
  it('inserts into exhibition_submissions', async () => {
    const c = chain({ data: { id: 's-1', submission_count: 0 }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await submitToExhibition('ex-1', 'user-1', 'post-1');

    expect((supabase.from as jest.Mock).mock.calls[0][0]).toBe('exhibition_submissions');
    expect(c.insert).toHaveBeenCalledWith(expect.objectContaining({
      exhibition_id: 'ex-1',
      user_id: 'user-1',
      post_id: 'post-1',
    }));
  });
});

describe('curateSubmission', () => {
  it('updates status + curator_note when note provided', async () => {
    const c = chain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await curateSubmission('s-1', 'accepted', 'Strong piece');

    expect(c.update).toHaveBeenCalledWith(expect.objectContaining({
      status: 'accepted',
      curator_note: 'Strong piece',
    }));
  });

  it('updates status only when no note', async () => {
    const c = chain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await curateSubmission('s-1', 'rejected');

    expect(c.update).toHaveBeenCalledWith({ status: 'rejected' });
  });
});

describe('getSubmissions', () => {
  it('filters by exhibition_id and orders by submitted_at', async () => {
    const c = chain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getSubmissions('ex-1');

    expect(c.eq).toHaveBeenCalledWith('exhibition_id', 'ex-1');
    expect(c.order).toHaveBeenCalledWith('submitted_at', { ascending: false });
  });
});

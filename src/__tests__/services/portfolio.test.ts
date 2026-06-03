import { supabase } from '@/lib/supabase';
import {
  getPortfolio,
  updateSection,
  deleteSection,
  removeItem,
  enablePortfolio,
  disablePortfolio,
} from '@/services/portfolio.service';

function chain(resolved: unknown) {
  const c: Record<string, jest.Mock> = {};
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'order', 'limit']) {
    c[m] = jest.fn().mockReturnValue(c);
  }
  c.single = jest.fn().mockResolvedValue(resolved);
  c.maybeSingle = jest.fn().mockResolvedValue(resolved);
  c.then = jest.fn((resolve) => resolve(resolved));
  return c;
}

beforeEach(() => jest.clearAllMocks());

describe('getPortfolio', () => {
  it('returns empty array when error', async () => {
    const c = chain({ data: null, error: { message: 'oops' } });
    (supabase.from as jest.Mock).mockReturnValue(c);

    const { data, error } = await getPortfolio('user-1');

    expect(data).toEqual([]);
    expect(error).toEqual({ message: 'oops' });
  });

  it('sorts items within each section by sort_order asc', async () => {
    const sections = [
      {
        id: 'sec-1',
        user_id: 'user-1',
        items: [
          { id: 'i-2', sort_order: 2 },
          { id: 'i-1', sort_order: 1 },
          { id: 'i-3', sort_order: 3 },
        ],
      },
    ];
    const c = chain({ data: sections, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    const { data } = await getPortfolio('user-1');

    expect(data?.[0]?.items?.map((i) => i.id)).toEqual(['i-1', 'i-2', 'i-3']);
  });
});

describe('updateSection / deleteSection', () => {
  it('updateSection writes the partial update', async () => {
    const c = chain({ data: { id: 'sec-1' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await updateSection('sec-1', { title: 'New title' });

    expect(c.update).toHaveBeenCalledWith({ title: 'New title' });
    expect(c.eq).toHaveBeenCalledWith('id', 'sec-1');
  });

  it('deleteSection deletes by id', async () => {
    const c = chain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await deleteSection('sec-1');

    expect(c.delete).toHaveBeenCalled();
    expect(c.eq).toHaveBeenCalledWith('id', 'sec-1');
  });
});

describe('removeItem', () => {
  it('deletes the portfolio_items row', async () => {
    const c = chain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await removeItem('item-1');

    expect(supabase.from).toHaveBeenCalledWith('portfolio_items');
    expect(c.delete).toHaveBeenCalled();
  });
});

describe('enablePortfolio / disablePortfolio', () => {
  it('enablePortfolio sets portfolio_enabled=true + bio + contact', async () => {
    const c = chain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await enablePortfolio('user-1', 'My bio', 'me@example.com');

    expect(c.update).toHaveBeenCalledWith({
      portfolio_enabled: true,
      portfolio_bio: 'My bio',
      portfolio_contact_email: 'me@example.com',
    });
  });

  it('disablePortfolio sets portfolio_enabled=false', async () => {
    const c = chain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await disablePortfolio('user-1');

    expect(c.update).toHaveBeenCalledWith({ portfolio_enabled: false });
  });
});

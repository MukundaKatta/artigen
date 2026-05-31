import { supabase } from '@/lib/supabase';
import {
  getTutorials,
  getTutorial,
  getLessons,
  getProgress,
  updateProgress,
  completeTutorial,
} from '@/services/tutorial.service';

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

describe('getTutorials', () => {
  it('filters published only by default', async () => {
    const c = chain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getTutorials();

    expect(c.eq).toHaveBeenCalledWith('is_published', true);
    expect(c.order).toHaveBeenCalledWith('sort_order', { ascending: true });
  });

  it('adds category filter when provided', async () => {
    const c = chain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getTutorials('basics');

    expect(c.eq).toHaveBeenCalledWith('category', 'basics');
  });
});

describe('getTutorial / getLessons', () => {
  it('getTutorial fetches single row by id', async () => {
    const c = chain({ data: { id: 't-1' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getTutorial('t-1');

    expect(c.eq).toHaveBeenCalledWith('id', 't-1');
    expect(c.single).toHaveBeenCalled();
  });

  it('getLessons orders by sort_order asc', async () => {
    const c = chain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getLessons('t-1');

    expect(c.eq).toHaveBeenCalledWith('tutorial_id', 't-1');
    expect(c.order).toHaveBeenCalledWith('sort_order', { ascending: true });
  });
});

describe('updateProgress', () => {
  it('creates a new progress row if none exists', async () => {
    const c = chain({ data: null, error: null }); // getProgress returns null
    (supabase.from as jest.Mock).mockReturnValue(c);

    await updateProgress('user-1', 't-1', 0);

    expect(c.insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user-1',
      tutorial_id: 't-1',
      current_lesson: 1,
      completed_lessons: [0],
    }));
  });

  it('updates an existing progress row', async () => {
    const c = chain({ data: { id: 'p-1', completed_lessons: [0, 1] }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await updateProgress('user-1', 't-1', 2);

    expect(c.update).toHaveBeenCalledWith(expect.objectContaining({
      current_lesson: 3,
      completed_lessons: [0, 1, 2],
    }));
  });
});

describe('completeTutorial', () => {
  it('sets is_completed=true and completed_at to now', async () => {
    const c = chain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await completeTutorial('user-1', 't-1');

    expect(c.update).toHaveBeenCalledWith(expect.objectContaining({
      is_completed: true,
      completed_at: expect.any(String),
    }));
    expect(c.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(c.eq).toHaveBeenCalledWith('tutorial_id', 't-1');
  });
});

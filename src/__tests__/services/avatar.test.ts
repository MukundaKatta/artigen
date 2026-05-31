import { supabase } from '@/lib/supabase';
import {
  createAvatarJob,
  getAvatarJob,
  getMyAvatars,
  saveAvatar,
  setActiveAvatar,
  removeAvatar,
} from '@/services/avatar.service';

function chain(resolved: unknown) {
  const c: Record<string, jest.Mock> = {};
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'order', 'limit']) {
    c[m] = jest.fn().mockReturnValue(c);
  }
  c.single = jest.fn().mockResolvedValue(resolved);
  c.then = jest.fn((resolve) => resolve(resolved));
  return c;
}

beforeEach(() => jest.clearAllMocks());

describe('createAvatarJob', () => {
  it('inserts a job row with userId, source images, style', async () => {
    const c = chain({ data: { id: 'job-1' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await createAvatarJob('user-1', ['https://example.com/1.jpg'], 'anime');

    expect(supabase.from).toHaveBeenCalledWith('avatar_generation_jobs');
    expect(c.insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user-1',
      source_image_urls: ['https://example.com/1.jpg'],
      style: 'anime',
      status: 'pending',
    }));
  });
});

describe('getAvatarJob / getMyAvatars', () => {
  it('getAvatarJob fetches single row by id', async () => {
    const c = chain({ data: { id: 'job-1' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getAvatarJob('job-1');

    expect(c.eq).toHaveBeenCalledWith('id', 'job-1');
    expect(c.single).toHaveBeenCalled();
  });

  it('getMyAvatars filters by user_id and orders by created_at desc', async () => {
    const c = chain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await getMyAvatars('user-1');

    expect(c.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(c.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });
});

describe('saveAvatar', () => {
  it('inserts a user_avatars row', async () => {
    const c = chain({ data: { id: 'av-1' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await saveAvatar('user-1', 'https://cdn/img.jpg', 'anime');

    expect(supabase.from).toHaveBeenCalledWith('user_avatars');
    expect(c.insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user-1',
      image_url: 'https://cdn/img.jpg',
      style: 'anime',
    }));
  });
});

describe('setActiveAvatar', () => {
  it('deactivates others then activates the chosen one', async () => {
    const c = chain({ data: { id: 'av-1', is_active: true }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await setActiveAvatar('user-1', 'av-1');

    // Two .update() calls — first to deactivate all, then to activate one
    expect(c.update).toHaveBeenCalledWith({ is_active: false });
    expect(c.update).toHaveBeenCalledWith({ is_active: true });
  });
});

describe('removeAvatar', () => {
  it('deletes by avatar id', async () => {
    const c = chain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(c);

    await removeAvatar('av-1');

    expect(c.delete).toHaveBeenCalled();
    expect(c.eq).toHaveBeenCalledWith('id', 'av-1');
  });
});

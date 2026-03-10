import { supabase } from '@/lib/supabase';
import { signUp, signIn, signOut, resetPassword, getSession } from '@/services/auth.service';

// supabase is auto-mocked via moduleNameMapper

beforeEach(() => {
  jest.clearAllMocks();
});

describe('signUp', () => {
  it('calls supabase.auth.signUp with email, password, and user metadata', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser, session: null },
      error: null,
    });

    const { data, error } = await signUp('test@example.com', 'password123', 'testuser', 'Test User');

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          username: 'testuser',
          full_name: 'Test User',
        },
      },
    });
    expect(data).toEqual({ user: mockUser, session: null });
    expect(error).toBeNull();
  });

  it('returns error when signUp fails', async () => {
    const mockError = { message: 'User already registered', status: 422 };
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const { data, error } = await signUp('existing@example.com', 'password123', 'taken', 'Taken Name');

    expect(error).toEqual(mockError);
    expect(data).toBeNull();
  });

  it('passes username and fullName through options.data', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({ data: {}, error: null });

    await signUp('a@b.com', 'pw', 'myuser', 'My Full Name');

    const callArgs = (supabase.auth.signUp as jest.Mock).mock.calls[0][0];
    expect(callArgs.options.data.username).toBe('myuser');
    expect(callArgs.options.data.full_name).toBe('My Full Name');
  });
});

describe('signIn', () => {
  it('calls supabase.auth.signInWithPassword with email and password', async () => {
    const mockSession = { access_token: 'abc', user: { id: 'user-1' } };
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession, user: mockSession.user },
      error: null,
    });

    const { data, error } = await signIn('test@example.com', 'password123');

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(data?.session).toEqual(mockSession);
    expect(error).toBeNull();
  });

  it('returns error for invalid credentials', async () => {
    const mockError = { message: 'Invalid login credentials', status: 400 };
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const { data, error } = await signIn('wrong@example.com', 'badpassword');

    expect(error).toEqual(mockError);
    expect(data).toBeNull();
  });
});

describe('signOut', () => {
  it('calls supabase.auth.signOut', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

    const { error } = await signOut();

    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(error).toBeNull();
  });

  it('returns error if signOut fails', async () => {
    const mockError = { message: 'Network error' };
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: mockError });

    const { error } = await signOut();

    expect(error).toEqual(mockError);
  });
});

describe('resetPassword', () => {
  it('calls supabase.auth.resetPasswordForEmail with the email', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
      data: {},
      error: null,
    });

    const { data, error } = await resetPassword('forgot@example.com');

    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('forgot@example.com');
    expect(error).toBeNull();
  });

  it('returns error for non-existent email', async () => {
    const mockError = { message: 'User not found' };
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const { error } = await resetPassword('nobody@example.com');

    expect(error).toEqual(mockError);
  });
});

describe('getSession', () => {
  it('returns session from supabase.auth.getSession', async () => {
    const mockSession = { access_token: 'tok', user: { id: 'u1' } };
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });

    const { session, error } = await getSession();

    expect(supabase.auth.getSession).toHaveBeenCalled();
    expect(session).toEqual(mockSession);
    expect(error).toBeNull();
  });

  it('returns null session when not authenticated', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    const { session, error } = await getSession();

    expect(session).toBeNull();
    expect(error).toBeNull();
  });

  it('returns error when getSession fails', async () => {
    const mockError = { message: 'Auth service unavailable' };
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error: mockError,
    });

    const { session, error } = await getSession();

    expect(session).toBeNull();
    expect(error).toEqual(mockError);
  });
});

import React, { useEffect } from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

function Spy({ onContext }: { onContext: (ctx: ReturnType<typeof useAuth>) => void }) {
  const ctx = useAuth();
  useEffect(() => {
    onContext(ctx);
  });
  return null;
}

beforeEach(() => {
  jest.clearAllMocks();
  // Default mock returns: empty data shapes (no signed-in user)
  (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
    data: { user: null, session: null },
    error: null,
  });
  (supabase.auth.signUp as jest.Mock).mockResolvedValue({
    data: { user: null, session: null },
    error: null,
  });
});

describe('<AuthProvider>', () => {
  it('exposes session=null and user=null on initial mount with no stored session', async () => {
    let captured: ReturnType<typeof useAuth> | null = null;
    await act(async () => {
      TestRenderer.create(
        <AuthProvider>
          <Spy onContext={(c) => { captured = c; }} />
        </AuthProvider>,
      );
    });

    expect(captured!.session).toBeNull();
    expect(captured!.user).toBeNull();
    expect(captured!.profile).toBeNull();
  });

  it('subscribes to onAuthStateChange and unsubscribes on unmount', async () => {
    const unsubscribe = jest.fn();
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe } },
    });

    let tree!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(
        <AuthProvider>
          <Spy onContext={() => {}} />
        </AuthProvider>,
      );
    });

    expect(supabase.auth.onAuthStateChange).toHaveBeenCalledTimes(1);

    await act(async () => {
      tree.unmount();
    });

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('signIn delegates to supabase.auth.signInWithPassword', async () => {
    let captured: ReturnType<typeof useAuth> | null = null;
    await act(async () => {
      TestRenderer.create(
        <AuthProvider>
          <Spy onContext={(c) => { captured = c; }} />
        </AuthProvider>,
      );
    });

    await act(async () => {
      await captured!.signIn('a@b.com', 'pw');
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pw',
    });
  });

  it('signIn returns { error } when supabase reports one', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'bad credentials' },
    });

    let captured: ReturnType<typeof useAuth> | null = null;
    await act(async () => {
      TestRenderer.create(
        <AuthProvider>
          <Spy onContext={(c) => { captured = c; }} />
        </AuthProvider>,
      );
    });

    let result!: { error: unknown };
    await act(async () => {
      result = await captured!.signIn('a@b.com', 'pw');
    });

    expect(result.error).toEqual({ message: 'bad credentials' });
  });

  it('signUp passes username + full_name via auth options.data', async () => {
    let captured: ReturnType<typeof useAuth> | null = null;
    await act(async () => {
      TestRenderer.create(
        <AuthProvider>
          <Spy onContext={(c) => { captured = c; }} />
        </AuthProvider>,
      );
    });

    await act(async () => {
      await captured!.signUp('new@user.com', 'pw', 'alice', 'Alice Liddell');
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new@user.com',
      password: 'pw',
      options: { data: { username: 'alice', full_name: 'Alice Liddell' } },
    });
  });

  it('signOut calls supabase.auth.signOut and clears profile', async () => {
    let captured: ReturnType<typeof useAuth> | null = null;
    await act(async () => {
      TestRenderer.create(
        <AuthProvider>
          <Spy onContext={(c) => { captured = c; }} />
        </AuthProvider>,
      );
    });

    await act(async () => {
      await captured!.signOut();
    });

    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    expect(captured!.profile).toBeNull();
  });
});

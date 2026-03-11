import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';
import { getProfile, ensureProfile } from '@/services/profile.service';
import { updateLastActive } from '@/services/activity.service';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session on mount and listen for auth changes
  useEffect(() => {
    // Get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        const meta = session.user.user_metadata;
        fetchProfile(session.user.id, { username: meta?.username, full_name: meta?.full_name });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Refresh auth token when app returns to foreground
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        supabase.auth.getSession().then(({ data: { session: freshSession } }) => {
          if (freshSession) {
            setSession(freshSession);
          }
        });
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, []);

  async function fetchProfile(userId: string, metadata?: { username?: string; full_name?: string }) {
    const { data } = await getProfile(userId);
    if (data) {
      setProfile(data as Profile);
      setLoading(false);
      // Update last active on login
      updateLastActive(userId);
      return;
    }

    // Profile missing (trigger failed) — create it from the client
    const username = metadata?.username || `user_${userId.slice(0, 8)}`;
    const fullName = metadata?.full_name || '';
    const { data: created } = await ensureProfile(userId, username, fullName);
    setProfile(created as Profile | null);
    setLoading(false);
  }

  async function handleSignIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error as Error | null };

    // Pass user metadata so fetchProfile can create the profile if missing
    if (data.user) {
      const meta = data.user.user_metadata;
      await fetchProfile(data.user.id, { username: meta?.username, full_name: meta?.full_name });
    }
    return { error: null };
  }

  async function handleSignUp(email: string, password: string, username: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: fullName },
      },
    });

    if (error) {
      // If "Database error saving new user", the trigger failed but we can
      // still try signing in — the auth user may have been created
      if (error.message.includes('Database error')) {
        const signInResult = await supabase.auth.signInWithPassword({ email, password });
        if (signInResult.data.user) {
          await fetchProfile(signInResult.data.user.id, { username, full_name: fullName });
          return { error: null };
        }
      }
      return { error: error as Error | null };
    }

    if (data.user) {
      await fetchProfile(data.user.id, { username, full_name: fullName });
    }
    return { error: null };
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  async function refreshProfile() {
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

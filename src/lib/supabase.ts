import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import { storage } from '@/lib/storage';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * App-wide Supabase client. Singleton — created once at module load and
 * reused for the entire app lifetime.
 *
 * Reads from `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
 * (both required at build time; `!` asserts they are present).
 *
 * Auth options:
 * - `storage`: AsyncStorage on native, localStorage on web (see `@/lib/storage`)
 * - `autoRefreshToken`: true — refreshes the access token before expiry while
 *   the app is in the foreground (managed below via AppState listener on native;
 *   always-on on web)
 * - `persistSession`: true — restores the session from storage on cold start
 * - `detectSessionInUrl`: web only — handles magic-link / OAuth redirect tokens
 *
 * Typed with the generated `Database` type for full table/column inference on
 * `.from('...')` calls.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Keep auth session fresh when app is in foreground
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
} else {
  // On web, just keep auto-refresh running
  supabase.auth.startAutoRefresh();
}

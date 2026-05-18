# Auth

Single source of truth for authentication: [`src/providers/AuthProvider.tsx`](../src/providers/AuthProvider.tsx).

## Lifecycle

```
app start
  └─ AuthProvider mounted
       ├─ supabase.auth.getSession()    ← reads persisted session from storage
       │     ├─ has session  → fetchProfile(user.id) → setLoading(false)
       │     └─ no session   → setLoading(false)
       │
       └─ supabase.auth.onAuthStateChange(...)  ← reacts to login/logout/refresh
             ├─ session    → fetchProfile + setSession
             └─ no session → setProfile(null)

AppState: 'active'
  └─ getSession() refresh → setSession(freshSession)
       (Supabase auto-refreshes the access token internally — see lib/supabase.ts)
```

## Where the session lives

- **Native:** `@react-native-async-storage/async-storage` via the `storage` adapter in `src/lib/storage.ts`
- **Web:** `localStorage` via the same adapter

The Supabase client is configured with `persistSession: true` and `autoRefreshToken: true` in [`src/lib/supabase.ts`](../src/lib/supabase.ts), and an `AppState` listener pauses/resumes auto-refresh on native.

## How protected routes work

Route layouts read `useAuth()` and redirect to `(auth)` if there's no session:

| Layout | Behavior |
|---|---|
| `app/_layout.tsx` | Top-level — provides `AuthProvider`, gates the splash screen on `loading` |
| `app/(auth)/_layout.tsx` | Sign-in / sign-up — redirects to `(tabs)` if already signed in |
| `app/(tabs)/_layout.tsx`, `app/(screens)/_layout.tsx`, `app/(camera)/_layout.tsx`, `app/(messages)/_layout.tsx`, `app/(stories)/_layout.tsx` | Authenticated surfaces — redirect to `(auth)/login` if no session |

## Adding a new auth-gated screen

1. Put the route file under one of the authenticated groups (`(tabs)`, `(screens)`, `(camera)`, `(messages)`, `(stories)`).
2. Read the current user via `const { user, profile } = useAuth()`. Both are non-null inside these groups.
3. **Do not** put redirect logic inside the screen — the layout handles it.

## Profile fetch / create

`AuthProvider.fetchProfile(userId, metadata?)` runs after every successful auth event:
1. Reads `profiles` row for `userId`.
2. If missing (DB trigger may have failed), calls `ensureProfile(userId, username, fullName)` to create it from the client using metadata from `auth.users.user_metadata`.
3. Side effects: `setErrorTrackingUser(...)` for crash reporting, `updateLastActive(userId)` for presence.

## Sign-in / sign-up error contract

Both return `{ error: Error | null }`. Callers (LoginScreen / RegisterScreen) inspect `error` and show a toast; no exceptions are thrown.

`signUp` has a fallback path: if Supabase reports `"Database error saving new user"` (the profile trigger failed), it transparently re-attempts `signInWithPassword` since the `auth.users` row was created, then runs `fetchProfile` to create the profile from the client.

## Known gaps (tracked in issues)

- **#262** No unit tests on AuthProvider (session bootstrap, refresh listener, sign-up fallback path)
- **#295** No session-expiry warning UX
- **#296** Cache invalidation incomplete after `refreshProfile` (downstream caches not broadcast)

## Sign out

`signOut()` calls `supabase.auth.signOut()` (which clears the persisted session), then locally clears `profile` and `errorTracking` user. The `onAuthStateChange` listener catches the SIGNED_OUT event and clears `session`.

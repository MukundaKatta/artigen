# Architecture

High-level map of how artigen is put together. Read this before making structural changes.

## Stack

- **React Native + Expo SDK 52** with the new architecture
- **expo-router** v4 — file-based routing under `src/app/`
- **Supabase** — Postgres, Auth, Storage, Realtime, Edge Functions
- **TypeScript strict** — see `tsconfig.json`
- **Jest + ts-jest** for unit tests; no E2E framework yet (see issues #265–269)

## Provider tree

Mounted in [`src/app/_layout.tsx`](../src/app/_layout.tsx), in order from outside in:

```
SafeAreaProvider
  └─ ThemeProvider             ← light/dark, theme tokens
       └─ AuthProvider          ← session, user, profile (see docs/AUTH.md)
            └─ NetworkProvider  ← online/offline state
                 └─ ToastProvider
                      └─ ErrorBoundary
                           └─ <Slot />   ← expo-router renders the active route
```

Every screen has access to: `useTheme`, `useAuth`, `useNetwork`, `useToast`.

## Service / hook pattern

Data flows through three layers:

1. **Service** (`src/services/<domain>.service.ts`) — pure data layer. Wraps Supabase. Returns `{ data, error }`. No React, no UI. Mocked in tests via `src/__mocks__/lib/supabase.ts`.
2. **Hook** (`src/hooks/use<Domain>.ts`) — orchestrates services. Owns state, optimistic updates, cache, realtime subscriptions. Returns `{ data, loading, error, ...actions }`.
3. **Component / screen** — consumes the hook. Stays as thin as possible; complex logic belongs in the hook.

Example: `getFeed` (service) ← `useFeed` (hook) ← `FeedScreen` (consumer).

## Realtime channels

Hooks own their own Supabase Realtime subscriptions and clean up on unmount. The service layer never subscribes — keeping subscriptions in hooks ties the channel lifetime to component mount.

Channels currently in use (non-exhaustive):

| Channel | Owner | Filters |
|---|---|---|
| `messages:conversation_id=eq.<id>` | `useChat` | INSERT / UPDATE / DELETE |
| `notifications:user_id=eq.<id>` | `useNotifications` | INSERT |
| `posts` | `useRealtimeFeed` | INSERT for the user's feed set |
| `conversation_participants:user_id=eq.<id>` | `useConversations` | UPDATE (last_read_at) |
| `presence-<conversationId>` | `useChat` | presence events |

> **Tip:** Search for `supabase.channel(` to enumerate every active subscription. There's an open issue (#288) for a maintained authoritative list.

## Navigation

[`expo-router`](https://docs.expo.dev/router/introduction/) — file-based. Top-level route groups:

| Group | Purpose | Auth-gated |
|---|---|---|
| `(auth)` | Login, register, forgot password | no (redirects to `(tabs)` if signed in) |
| `(tabs)` | Home, Explore, Camera, Activity, Profile | yes |
| `(screens)` | All other authenticated screens (settings, user/[id], post/[id], etc.) | yes |
| `(camera)` | New post / new story camera flows | yes |
| `(messages)` | Conversation list + thread views | yes |
| `(stories)` | Story viewer (full-screen) | yes |

Each group has its own `_layout.tsx` that wraps children in the appropriate `ErrorBoundary` and applies group-level styling.

## Theme

Tokens live in [`src/lib/theme.ts`](../src/lib/theme.ts):
- `colors` — flat object of named color tokens
- `themeColors` (light / dark) — surface-level tokens that swap based on theme
- `spacing`, `fontSize`, `typography`, `borderRadius`, `shadows`, `gradients`

`ThemeProvider` exposes `themeColors` (named `tc` in most consumers) for theme-reactive surfaces. Static styles use the flat `colors` import — the rare cases where the static value is OK (e.g. brand-color highlights).

## State management

No Redux / Zustand / global state. State lives:
- **Inside the hook that owns the data** (the dominant pattern)
- **In a provider context** for cross-cutting concerns (auth, theme, network, toast)
- **In React Query–style in-memory cache** via `src/lib/api-cache.ts` for stale-while-revalidate

## Web vs native build

The same source tree builds for native (iOS / Android via Expo) and web (`expo export --platform web` then Firebase Hosting). Key divergences:

- **Storage:** `AsyncStorage` (native) vs `localStorage` (web) — abstracted by `src/lib/storage.ts`
- **Haptics:** `expo-haptics` is no-op on web; call sites already gate on `Platform.OS !== 'web'`
- **Auth session-in-URL detection:** enabled on web only (for magic-link / OAuth)
- **AppState refresh listener:** native only (web doesn't background the same way)
- **Camera / file picker:** different code paths via `Platform.OS` checks

For deeper web-specific concerns see `scripts/patch-web-html.js` and `firebase.json`.

## Error handling

Two layers:
1. **`ErrorBoundary`** ([`src/components/shared/ErrorBoundary.tsx`](../src/components/shared/ErrorBoundary.tsx)) — every route layout wraps children. Reports to telemetry, offers retry + go-home.
2. **`FeatureErrorBoundary`** ([`src/components/ui/ErrorBoundary.tsx`](../src/components/ui/ErrorBoundary.tsx)) — thin wrapper used for feature-scoped wrapping with a smaller inline fallback.

Service-layer errors are returned as `{ error }`, not thrown. Hook layer optimistic updates revert on error and surface a toast via `useToast`.

## Telemetry

[`src/lib/telemetry.ts`](../src/lib/telemetry.ts) batches `analytics_events` rows and flushes every 30s (or on batch-of-10). Dev mode also `console.log`s every event for visibility. Use `trackEvent(TELEMETRY_EVENTS.<name>, payload)` from anywhere.

## Migrations

Plain SQL files under [`migrations/`](../migrations/) ordered by leading integer. See [`docs/DATABASE.md`](./DATABASE.md) for full details and the contribution rules in [`CONTRIBUTING.md`](../CONTRIBUTING.md).

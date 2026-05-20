# Realtime channels

Authoritative list of every Supabase Realtime channel the app subscribes to. Keep this updated when adding or renaming channels — use `grep -rn ".channel(" src/` to find every callsite.

## Active channels

| Channel name | Owner | Events | Filter | Lifecycle |
|---|---|---|---|---|
| `feed-realtime` | [`src/hooks/useRealtimeFeed.ts`](../src/hooks/useRealtimeFeed.ts) | `postgres_changes` INSERT/DELETE on `posts` | none (all posts) | mount → unmount of any consumer of `useRealtimeFeed`; payload filtered client-side to exclude the viewer's own posts |
| `chat-<conversationId>` | [`src/hooks/useChat.ts`](../src/hooks/useChat.ts) | `postgres_changes` INSERT/UPDATE/DELETE on `messages` | `conversation_id=eq.<id>` | mount → unmount of conversation view |
| `presence-<conversationId>` | [`src/hooks/useChat.ts`](../src/hooks/useChat.ts) | presence join/leave/sync | conversation-scoped | mount → unmount of conversation view; uses the viewer's user id as the presence key |
| `conversations-updates` | [`src/hooks/useConversations.ts`](../src/hooks/useConversations.ts) | `postgres_changes` UPDATE on `conversation_participants` (for `last_read_at`) | none (server filters by RLS to the viewer's rows) | mount → unmount of the conversations list |
| `collab-room-<roomId>` | [`src/services/collab-room.service.ts`](../src/services/collab-room.service.ts) | broadcast events for the collab editor (cursor moves, edits) | none (room-scoped channel) | explicit `joinCollabRoom` / `leaveCollabRoom` calls; not owned by a hook |

## Conventions

- **Naming:** lowercase kebab-case with `:<scope>` for entity-scoped channels (or `-<id>` suffix where colons would confuse the URL). Stay consistent within a feature.
- **Ownership:** prefer hooks for component-bound subscriptions (mount/unmount tied to channel lifetime). Service-layer subscriptions (like `collab-room`) must document explicit cleanup.
- **Cleanup:** every subscription MUST have a matching `supabase.removeChannel(channel)` in its cleanup path. The hooks above do this via `useEffect` return functions.
- **Filtering:** prefer server-side `filter: 'col=eq.<value>'` over client-side filtering — RLS already restricts to the viewer's data, and server filtering reduces wasted network traffic.
- **Auth required:** Realtime respects RLS. The viewer must be authenticated and have SELECT permission on the underlying table; otherwise the channel silently delivers nothing.

## Adding a new channel

1. Pick a unique name following the conventions above.
2. Subscribe inside a hook (preferred) or service function with explicit lifecycle.
3. Always unsubscribe on cleanup — pair `supabase.channel(...)` with `supabase.removeChannel(channel)` in the `useEffect` return.
4. **Add a row to the table above.**
5. If the channel uses `broadcast` (not `postgres_changes`), document the event names you emit/listen for.

## Debugging

- Open `https://supabase.com/dashboard/project/<id>/realtime/inspector` and check the connected channels live.
- Enable `console.log` in dev for the channel callbacks to verify events arrive.
- Common gotcha: forgetting to call `.subscribe()` at the end of the chain — the channel exists but never connects.

## Known issues

- **#279** Presence updates in `useChat` are not throttled — high-traffic conversations can cause layout thrash.
- **#288** This file was previously missing (tracked by the issue that prompted it).

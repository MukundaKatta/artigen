# Feature flags

Single source of truth: [`src/lib/feature-flags.ts`](../src/lib/feature-flags.ts).

The flag system is intentionally small — flags are a flat key/value map of booleans, resolved from defaults → env overrides → caller overrides.

## Declaring a new flag

1. Add the key to `FUTURE_FEATURE_KEYS` (one line).
2. Add a default value to `DEFAULT_FLAGS` (typically `false` — flags ship off).

That's it. The new key is automatically picked up by `getFeatureFlags`, `isFeatureEnabled`, and `EXPO_PUBLIC_FF_*` env-var overrides.

```ts
export const FUTURE_FEATURE_KEYS = [
  'live_provenance',
  'transparency_center',
  // ... add new flag here
  'my_new_feature',
] as const;

const DEFAULT_FLAGS: FeatureFlagMap = {
  // ... existing defaults
  my_new_feature: false,
};
```

## Reading a flag

```ts
import { isFeatureEnabled } from '@/lib/feature-flags';

if (isFeatureEnabled('my_new_feature')) {
  // gated code path
}
```

Or get the full map (useful for screens that gate multiple sections):

```ts
import { getFeatureFlags } from '@/lib/feature-flags';

const flags = getFeatureFlags();
if (flags.live_provenance && flags.transparency_center) { ... }
```

There is no React hook — flags are evaluated synchronously and don't change at runtime within a process. Re-evaluate on remount.

## Flipping flags

Flags can be enabled in three ways, in increasing override precedence:

1. **Default** — `DEFAULT_FLAGS` in `feature-flags.ts`. Change the source and ship a build.
2. **Env variable** — `EXPO_PUBLIC_FF_<KEY_UPPERCASE>=true` in `.env` (or `.env.production`, etc.). Picked up at build time. Use this for per-environment rollout (e.g. enabled in staging, off in prod).
3. **Caller override** — `getFeatureFlags({ my_new_feature: true })`. Use this only in tests or for one-off forced-enable in dev tools.

Accepted truthy values (env): `1`, `true`, `yes`, `on`. Anything else is treated as `false`.

## Production rollout flow

Today there's no remote-config service — flips require a code change and a build. Typical flow:

1. New feature lands behind a flag (default `false`).
2. Internal testing via `EXPO_PUBLIC_FF_<KEY>=true` in `.env`.
3. Beta rollout via staging environment with the env var on.
4. Production rollout by flipping the default to `true` and shipping a release.
5. After a stabilization window with no rollback, **clean up the flag** (remove the key from `FUTURE_FEATURE_KEYS`, remove the default, inline the previously-gated code path, delete all `isFeatureEnabled('my_feature')` callsites).

## Cleaning up a flag

Flag rot is real. Once a feature is fully rolled out and a few releases have passed without rollback:

1. Remove the key from `FUTURE_FEATURE_KEYS` and `DEFAULT_FLAGS`.
2. Remove every `isFeatureEnabled('<key>')` and `flags.<key>` callsite — keep the previously-gated branch, delete the other.
3. Remove the env var from `.env.example` and any deploy configs.

This also keeps `getFeatureFlags()` honest as a discovery surface: every key listed there should be a flag that's actively being rolled out, not historical scaffolding.

## Telemetry

`trackEvent(TELEMETRY_EVENTS.future_flag_override_applied, ...)` exists in `src/lib/telemetry.ts` for tracking when an env or caller override changes a flag's resolved value. Wire this into `getFeatureFlags` if you need visibility into who's running which combination.

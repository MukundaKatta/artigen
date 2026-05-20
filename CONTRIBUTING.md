# Contributing

Thanks for your interest in artigen. This doc covers the conventions used in this repo so your changes go through smoothly.

## Branch naming

- `claude/<short-description>-<hash>` for work driven by Claude Code
- `feat/<short-description>` for new features
- `fix/<short-description>` for bug fixes
- `chore/<short-description>` for tooling, deps, docs

Branch off `main`. Don't push directly to `main`.

## Commit messages

Use conventional commits:

```
type(scope?): subject

optional body explaining the why
```

Common types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`, `style`.

Examples:
- `fix(feed): use stable keys for carousel dots`
- `feat(auth): add session-expiry warning toast`
- `docs(readme): add prerequisites and architecture sections`

Keep subjects under ~70 chars. Use the body for context.

## Before pushing

Run the full local check:

```bash
npm run lint
npm run typecheck
npm test
npm run format:check
```

All four run in CI and block merge.

## Adding a new screen

1. Create the route file under `src/app/(group)/<name>.tsx`. The group determines layout wrapping.
2. If the screen needs heavy logic, extract it into `src/screens/<Name>Screen.tsx` and keep the route file thin.
3. Wrap it in an `ErrorBoundary` (the group layout usually does this for you).
4. Add a JSDoc block at the top of the screen file describing its purpose.

## Adding a new service

A service is a pure data-layer module in `src/services/<domain>.service.ts`:

1. Export typed async functions returning `{ data, error }` (mirror Supabase's shape).
2. Add JSDoc on every exported function — one-sentence purpose, params, return semantics, side effects.
3. Wrap the matching tests in `src/__tests__/services/<domain>.test.ts` with a mocked Supabase client (see existing tests for the pattern).
4. Hooks that consume the service live in `src/hooks/use<Domain>.ts`.

## Adding a new migration

1. Create a new file under `migrations/` named `NNN_short_description.sql`. NNN should be a fresh integer — check existing migration numbers to avoid duplicates.
2. **Every migration MUST include a `-- Rollback` section** with the inverse SQL at the bottom (commented out).
3. Add or update RLS policies for any new user-content table — never leave a user-content table with RLS disabled.
4. After running locally, regenerate `src/types/database.ts` from your Supabase project.

## Running tests

```bash
npm test                    # full suite
npm test -- <pattern>       # filter by file path
npm test -- --coverage      # with coverage report
npm run test:watch          # watch mode
```

Tests live in `src/__tests__/` mirroring the source tree.

## Code style

- TypeScript strict mode is on; new `any` is discouraged
- Prefer named exports; default exports only when expo-router requires them
- Components use `function ComponentName({}: Props) { ... }`, not class components
- Hooks return objects (`{ data, loading, error, refresh }`), not tuples
- No comments explaining WHAT the code does — only WHY when non-obvious

## Reporting issues

When filing a bug, include:
- Platform (iOS / Android / web) and version
- Reproduction steps
- Expected vs. actual behavior
- Screenshots or screen recordings if UI-related

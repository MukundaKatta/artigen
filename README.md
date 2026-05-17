# artigen

AI art community platform built with React Native, Expo, and Supabase.

**Live demo:** <https://mukundakatta.github.io/artigen/>

## What's inside

- AI image generation (multiple model providers, credit system)
- Social feed: posts, comments, likes, reactions, reposts, saves, shares
- Stories with audience controls (public / close friends)
- Realtime messaging: text, voice notes, stickers, reactions, presence
- Battles, exhibitions, weekly events, leaderboards
- Avatar generator, portfolio, prompt library, art coach
- Marketplace, tips, subscriptions, credits

See [`FEATURES.md`](./FEATURES.md) for a fuller catalog and [`ANALYSIS.md`](./ANALYSIS.md) for a system overview.

## Prerequisites

- **Node.js** 20.x (matches CI)
- **npm** 10.x (the lockfile is npm)
- **Expo CLI** — installed transitively; invoked via `npx expo`
- **EAS CLI** — only needed for native production builds (`npm install -g eas-cli`)
- An **iOS simulator** (Xcode) or **Android emulator** (Android Studio) for native dev — web works without either

## Local setup

```bash
git clone https://github.com/MukundaKatta/artigen.git
cd artigen
npm install
cp .env.example .env
# Fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env
```

## Running the app

```bash
npm run web        # browser (fastest iteration)
npm run ios        # iOS simulator
npm run android    # Android emulator
npm start          # Expo dev server with QR for Expo Go
```

## Verifying before pushing

```bash
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # Jest
npm run format:check # Prettier
```

All four run in CI on every PR. Pre-commit hooks aren't wired up yet (see issue list); for now run them yourself.

## Layout

```
src/
├── app/             expo-router routes (tabs, screens, camera, messages, stories, auth)
├── components/      reusable components (ui/, shared/, feed/, profile/, ...)
├── hooks/           feature hooks (useFeed, useChat, useAiGeneration, ...)
├── lib/             cross-cutting infra (supabase, theme, telemetry, retry, ...)
├── providers/       app-wide context providers (Auth, Theme, Toast)
├── screens/         screen components used inside route files
├── services/        Supabase-backed data layer (one file per domain)
├── types/           shared TS types (incl. generated Database type)
└── utils/           pure helpers (format-date, format-number, ...)
```

## Architecture cheat sheet

- **State:** local component state + Supabase queries via hooks; no Redux/Zustand
- **Realtime:** Supabase Realtime channels in feature hooks (`useChat`, `useRealtimeFeed`, `useConversations`)
- **Navigation:** expo-router file-based routing under `src/app/`
- **Theming:** light/dark via `ThemeProvider`, tokens in `src/lib/theme.ts`
- **Errors:** wrap features in `ErrorBoundary` (`src/components/shared/ErrorBoundary.tsx`)
- **Feature flags:** see `src/lib/feature-flags.ts`

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for branch naming, commit message format, and how to add a new screen/service/migration.

## Documentation

- [`docs/`](./docs/) — system docs (DATABASE.md, REALTIME.md, etc.)
- [`ANALYSIS.md`](./ANALYSIS.md) — system overview and rationale
- [`FEATURES.md`](./FEATURES.md) — feature catalog

## License

MIT — see [`LICENSE`](./LICENSE).

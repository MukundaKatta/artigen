# Artigen

Updated: 2026-03-02

AI Art Community app for creating, sharing, and discovering AI-generated art.

## Overview
Artigen is a large Expo + Supabase codebase that combines:
- AI creation tools (generate, restyle, inpaint/outpaint, controlnet, upscale, animation, text-to-3D, avatar/music generation)
- Social platform features (feed, stories, DMs, communities, collaborations, reactions, reposts, critiques)
- Creator economy features (subscriptions, wallet/tips, marketplace)
- Discovery/personalization features (trending, visual search, taste profiles, blend feeds)
- Learning and growth systems (tutorials, XP, mentorship, events, battles, exhibitions)

## Current Codebase Snapshot

| Metric | Count |
|---|---:|
| App route files (`src/app/**`) | 109 |
| Screens in `(screens)` group | 63 |
| Camera/creation routes | 13 |
| Message routes | 5 |
| Story routes | 2 |
| Components | 155 |
| Custom hooks | 77 |
| Service modules | 75 |
| SQL migrations | 42 |
| Supabase edge functions | 17 |

## Core Feature Areas

### AI Creation
- Text-to-image generation with multiple model backends.
- Restyle, remix, inpaint, outpaint, upscale, and ControlNet flows.
- Image animation jobs.
- Text-to-3D generation.
- Avatar and music generation jobs.
- Prompt library and prompt remix.
- AI metadata and provenance signing/verification support.

### Social Platform
- Feed, post interactions, comments/replies, reactions, reposts, polls, awards.
- Stories with interactive stickers.
- DMs with voice messages, notes, vanish mode, blend feeds.
- Following graph, close friends, blocking, reporting.
- Communities and collaborative posts.
- Critiques and helpful voting.

### Discovery and Personalization
- Search across users/posts/hashtags/communities/prompts.
- Explore masonry surfaces and trending routes.
- Visual similarity search via embeddings.
- Taste profiles and engagement signal tracking.

### Creator and Growth Systems
- Post insights, scheduled posts, profile customization, portfolio tools.
- Workflows and workflow runs.
- Challenges, weekly events, art battles, exhibitions, events.
- Learning system with tutorials, lessons, XP, and mentorship.

### Monetization
- Subscription tiers and subscriber-gated content.
- Wallet and tipping flows.
- Marketplace listings and order management.

## Known Partial/Placeholder Areas
- Wallet deposit and withdrawal rails are present in UI but payment/payout integrations are not fully wired.
- Some edge functions currently contain placeholder external provider endpoints (for example: restyle, animate, embed-image, safety-check).
- A few screens still contain mock auth TODO markers (notably critique/avatar flows).
- AR preview is currently simulated UI and not full live camera ARKit/ARCore.

## Tech Stack
- Frontend: React Native 0.76, Expo 52, Expo Router 4
- Backend: Supabase (Postgres, Auth, Storage, Realtime, Edge Functions)
- Language: TypeScript
- Mobile/Web targets: iOS, Android, Web

## Setup

### Prerequisites
- Node.js 18+
- npm
- Supabase project
- EAS CLI (for mobile cloud builds)

### Installation
```bash
git clone https://github.com/MukundaKatta/artigen.git
cd artigen
npm install
```

### Environment
Create `.env` with:
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run
```bash
npm start
npm run android
npm run ios
npm run web
```

## Build and Deploy Scripts
- `npm run build:web` - Export web bundle
- `npm run deploy:web` - Export web bundle and deploy to Firebase Hosting
- `npm run build:apk` - EAS Android preview build
- `npm run build:ios` - EAS iOS preview build
- `npm run build:prod` - EAS production build for all platforms

## Database and Backend
- SQL migrations live in `migrations/` and should be applied in filename order.
- Edge functions live in `supabase/functions/`.
- See [docs/DATABASE.md](docs/DATABASE.md) for migration inventory, tables, RPCs, and backend notes.

## Project Structure
```
src/
  app/                  # Expo Router routes (tabs, camera, screens, messages, stories)
  components/           # UI and feature components
  hooks/                # Feature hooks and state orchestration
  services/             # Supabase and domain service layer
  providers/            # Auth/theme providers
  lib/                  # Shared client/config/constants/theme helpers
  types/                # App and database TypeScript types
migrations/             # Supabase SQL migration files
supabase/functions/     # Deno edge functions
docs/                   # Product and database documentation
```

## Documentation
- [docs/FEATURES.md](docs/FEATURES.md) - Product feature map and implementation status
- [docs/DATABASE.md](docs/DATABASE.md) - Migration inventory, schema domains, RPC/functions

## License
Private repository.

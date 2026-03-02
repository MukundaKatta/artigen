# Artigen

*Updated March 2, 2026*

AI Art Community — Create, share, and discover AI-generated art.

Artigen is a full-featured social media platform purpose-built for AI art creators. Generate images with multiple AI models, share your work, remix others' art, compete in daily challenges, earn badges, join communities, and more.

## Tech Stack

- **Frontend:** React Native 0.76 + Expo 52 + Expo Router 4
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime)
- **AI:** Replicate (Flux, SDXL, SD3), Hugging Face (SD 2.1), CLIP embeddings
- **Language:** TypeScript (strict, zero errors)

## Features

### AI Art Generation
- Text-to-image with 5 models (Flux Schnell, Flux Dev, SDXL, SD 2.1, SD3)
- Style transfer (restyle existing images)
- Image animation (motion, zoom, pan, morph, parallax)
- Prompt library (save, share, browse community prompts)
- Art remixing with attribution chain
- Visual similarity search via CLIP embeddings (pgvector)
- Art provenance and cryptographic signing (C2PA)

### Social Platform
- Feed with infinite scroll, reactions (7 types), comments, saves, reposts
- Stories with interactive stickers (polls, quizzes, Q&A, sliders, countdowns)
- Reels
- Direct messages with voice messages, vanish mode, blend feeds
- Notes (ephemeral 24h status messages)
- Communities / art groups with roles and moderation
- Close friends with exclusive content sharing
- Collaborative posts
- Polls attached to posts

### Gamification
- Daily creative challenges with community voting
- 15 achievement badges across 6 categories
- Posting streaks with fire badge
- Awards system (6 types, 4 tiers)
- Creator leaderboard (weekly, monthly, all-time)

### Monetization
- Creator subscription tiers
- Wallet with deposit/withdrawal
- Tip jar
- Marketplace (digital downloads, print-on-demand)

### Discovery
- Pinterest-style masonry explore grid
- Search users, hashtags, posts, communities
- Taste profile for personalized recommendations
- Trending prompts and styles
- Location tagging with map view

### Safety
- AI content classification (safe/sensitive/mature/NSFW)
- User safety preferences
- Community content ratings
- Content warning overlays

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Supabase project ([supabase.com](https://supabase.com))

### Setup

```bash
# Clone the repository
git clone https://github.com/MukundaKatta/artigen.git
cd artigen

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your Supabase URL and anon key to .env

# Run database migrations (in order, in Supabase SQL Editor)
# See docs/DATABASE.md for migration order

# Start development server
npm start
```

### Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
  app/                  # Expo Router screens (67+ screens)
    (tabs)/             # Tab navigator (Home, Search, Create, Reels, Profile)
    (camera)/           # Camera & AI generation screens
    (screens)/          # Stack screens (settings, communities, challenges, etc.)
    (messages)/         # DM screens
    (stories)/          # Story viewer
  components/           # Reusable UI components (100+)
    feed/               # PostCard, reactions, awards, polls, remix
    profile/            # ProfileHeader, badges, streaks, collections
    messages/           # Voice messages, notes, blend feed
    community/          # Community cards, headers
    challenges/         # Badge grid
    explore/            # Masonry grid
    leaderboard/        # Leaderboard rows
    stories/            # Story stickers
    ui/                 # Skeleton, modals, indicators
  hooks/                # Custom React hooks (48)
  services/             # Supabase service layer (55 files)
  providers/            # Auth context provider
  types/                # TypeScript types (database.ts, index.ts)
  lib/                  # Theme, constants, storage, supabase client
migrations/             # SQL migrations (34 files)
supabase/functions/     # Edge functions (8)
docs/                   # Documentation
```

## Documentation

- [Features](docs/FEATURES.md) — Complete feature documentation
- [Database](docs/DATABASE.md) — Schema reference, migrations, RPC functions

## Codebase Stats

| Metric | Count |
|--------|-------|
| Screens | 67+ |
| Components | 100+ |
| Custom Hooks | 48 |
| Service Files | 55 |
| SQL Migrations | 34 |
| Edge Functions | 8 |
| TypeScript Errors | 0 |
| Bundled Modules | 2,080 |

## License

This project is private.

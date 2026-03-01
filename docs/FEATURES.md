# Artigen - Feature Documentation

**Artigen** is a full-featured AI art community platform for creating, sharing, and discovering AI-generated art. Built with React Native (Expo) and Supabase.

---

## Table of Contents

1. [Core Platform](#core-platform)
2. [AI Art Generation](#ai-art-generation)
3. [Social Features](#social-features)
4. [Stories](#stories)
5. [Messaging & DMs](#messaging--dms)
6. [Discovery & Search](#discovery--search)
7. [Communities](#communities)
8. [Gamification](#gamification)
9. [Monetization](#monetization)
10. [Content Safety](#content-safety)
11. [Creator Tools](#creator-tools)

---

## Core Platform

### Feed
- Infinite-scroll home feed showing posts from followed users and your own posts
- Posts support image, video, carousel (multi-image), and reel formats
- Each post displays: user avatar, username, location tag, caption with hashtags, like/comment/share/save actions
- Pull-to-refresh and pagination

### Profile
- Customizable profile with avatar, bio, website link, and interest tags
- Profile theme customization (colors, layout)
- Post grid (3 columns), saved posts, and tagged posts tabs
- Follower/following counts with tap-to-view lists
- Pinned posts (up to 3)
- Top friends display
- Badge showcase and streak counter
- Private account option with follow requests

### Navigation
- 5-tab layout: Home, Search, Create, Reels, Profile
- Stack navigation for detail screens (67+ screens)
- Deep linking support via Expo Router

---

## AI Art Generation

### Text-to-Image Generation
- **Models supported:**
  - Flux Schnell (fast, free via Replicate)
  - Flux Dev (high quality via Replicate)
  - SDXL 1.0 (via Replicate)
  - Stable Diffusion 2.1 (free via Hugging Face)
  - Stable Diffusion 3 (via Replicate)
- Prompt input with negative prompt support
- Adjustable settings: steps, guidance scale, seed
- Aspect ratio picker (1:1, 4:5, 16:9, 9:16, 3:2, 2:3) with model-aware dimensions
- Generation history

### Style Transfer (Restyle)
- Transform existing images using AI style presets
- Custom style prompts
- Style preset library organized by category (artistic, photographic, etc.)
- Preview before posting

### Image Animation
- Convert static images to short animations
- Animation types: motion, camera pan, parallax, zoom, morph
- Adjustable duration
- Post as reel or video

### Prompt Library
- Save and share AI generation prompts
- Browse public prompts sorted by popularity
- Search prompts by title or content
- Save/unsave prompts from other users
- Use any saved prompt to generate new art
- Prompt details: title, prompt text, negative prompt, model, settings, style tags

### Prompt Remix
- Take an existing post's AI prompt and modify it
- Side-by-side comparison of original and modified prompts
- Attribution to original prompt author
- Changes description tracking

### AI Caption Generation
- Auto-generate captions for posts using AI

### Visual Similarity Search
- Find visually similar posts using CLIP embeddings
- Search by uploading an image

### Art Provenance
- Cryptographic signing of AI-generated content
- Content hash, prompt hash, model info, generation date
- C2PA manifest support
- Verification status tracking (verified/unverified/tampered)
- Provenance badge displayed on posts

---

## Social Features

### Following System
- Follow/unfollow users
- Follow requests for private accounts
- Suggested users based on mutual connections
- Activity status (online/last active)

### Post Interactions
- **Likes** - Standard like with heart animation
- **Emoji Reactions** - 7 reaction types: like, love, haha, wow, sad, fire, clap
- **Comments** - Threaded comments with replies, likes, and pinning
- **Save** - Save to default or custom collections
- **Share** - Share posts via DM or external apps
- **Repost** - Repost with optional quote text
- **Awards** - Give tiered awards (Fire, Love It, Mind Blown, Masterpiece, Diamond, Trophy)

### Remixes
- Remix any AI-generated post
- Pre-fills the generate screen with the original post's prompt, model, and settings
- Remix badge showing "Remixed from @username"
- View all remixes of a post in a grid
- Remix chain tracking (remix of a remix)

### Polls
- Attach polls to posts with multiple options
- Animated vote percentage bars
- One vote per user
- Optional expiration time
- Total vote count display

### Collaborative Posts
- Invite collaborators to co-author posts
- Collaboration status: pending, accepted, declined
- Multiple collaborator avatars displayed on post

### Close Friends
- Curate a close friends list
- Share stories exclusively with close friends
- Visual indicator (green ring) for close friends stories

### Notifications
- Activity types: likes, comments, follows, follow requests, mentions, story replies, comment likes, collab invites, subscriptions, tips, community invites, prompt remixes
- Unread badge count

### User Blocking
- Block/unblock users
- Blocked users cannot view your profile or posts

### Reporting
- Report posts or users for policy violations

---

## Stories

### Story Creation
- Photo and video stories
- 24-hour auto-expiry
- Close friends exclusive option
- Story highlights (permanent collections)

### Interactive Stickers
- **Poll Sticker** - Two-option polls
- **Quiz Sticker** - Multiple choice with correct answer
- **Question Sticker** - Open-ended Q&A
- **Emoji Slider** - Sliding scale emoji response
- **Countdown Sticker** - Timer to an event
- **Link Sticker** - Clickable external links
- Sticker response tracking and analytics

### Story Viewing
- Tap-to-advance, swipe between users
- View count tracking
- Reply to stories via DM

---

## Messaging & DMs

### Conversations
- 1-to-1 direct messages
- Group conversations with avatars
- Conversation list with last message preview and unread count

### Message Types
- Text messages
- Image/video sharing
- Post sharing (forward posts via DM)
- Story replies
- Voice messages with recording and playback

### Message Features
- Emoji reactions on messages
- Vanish mode (disappearing messages)
- Online status indicators

### Notes
- Instagram-style ephemeral status messages (max 60 characters)
- Emoji attachment
- 24-hour auto-expiry
- Displayed as circular bubbles above conversation list
- Tap to view full note

### Blend Feed
- Shared feed between two users
- AI-curated content mixing both users' preferences

---

## Discovery & Search

### Search
- Search users, hashtags, and posts
- Recent searches history
- Suggested content

### Explore
- Pinterest-style masonry grid (2 columns, proportional heights) with scroll-based pagination
- AI posts get subtle sparkle overlay
- Trending posts and styles
- Trending prompt cards with "Use" button
- Visual similarity search — upload an image to find similar AI art

### Hashtags
- Auto-extraction from captions
- Hashtag feed pages
- Post count per hashtag

### Locations
- Tag posts with locations
- Location feed pages
- Explore map view

### Taste Profile & Personalization
- Set preferred styles, models, themes, and color palettes
- Dislike filtering for styles and themes
- Engagement signal tracking (views, likes, saves, comments, shares)
- AI-powered personalized feed recommendations

---

## Communities

### Community Management
- Create communities with name, description, avatar, cover image
- Public or private communities
- Community rules (list)
- Tag-based categorization
- Member count tracking

### Membership & Roles
- Three roles: owner, moderator, member
- Join/leave communities
- Owner can manage member roles

### Community Content
- Community-specific post feed
- Post to community option when creating posts
- Browse and discover communities
- Search communities by name

---

## Gamification

### Daily Challenges
- New creative prompt theme every day
- 50+ curated prompts (e.g., "Underwater city at sunset", "A cat as a Renaissance painting")
- Challenge banner card at top of feed
- Submit entries by generating art with challenge theme
- Community voting on entries
- Past challenge history with winners
- Edge function auto-generates daily prompts using date-based rotation

### Achievement Badges
- 15 badges across 6 categories:
  - **Creation:** First Spark (1 post), Prolific Creator (10), Art Machine (50)
  - **AI:** AI Pioneer (1 gen), Prompt Master (10 gens)
  - **Engagement:** Rising Star (100 likes), Superstar (1000 likes)
  - **Social:** Remixer (1 remix), Remix Legend (10), Community Builder (100 followers), Team Player (1 collab)
  - **Challenge:** Challenger (1 entry), Champion (win)
  - **Streak:** Week Warrior (7 days), Monthly Master (30 days)
- Auto-awarded when milestones are reached
- Badge grid on profile

### Posting Streaks
- Consecutive daily post tracking
- Current streak and longest streak
- Fire icon badge on profile
- Integrates with badge system (7-day, 30-day milestones)

### Leaderboard
- Weekly, monthly, and all-time tabs
- Ranked by weighted score (posts, followers, awards)
- Top 3 podium display with medals
- Tap to view creator profile

### Awards System
- 6 award types across 4 tiers:
  - **Bronze:** Fire, Love It
  - **Silver:** Mind Blown, Masterpiece
  - **Gold:** Diamond
  - **Diamond:** Trophy
- Award picker bottom sheet
- Award badges displayed on posts
- Awards contribute to leaderboard score

---

## Monetization

### Creator Subscriptions
- Create subscription tiers with name, description, price, benefits
- Custom badge labels and colors per tier
- Max subscriber limits
- Subscriber management and analytics
- Exclusive content gating by tier

### Wallet System
- In-app wallet with balance tracking
- Deposit and withdrawal support
- Transaction history with types: deposit, withdrawal, tip sent/received, purchase, sale, subscription payment/earning
- Lifetime earned/spent tracking

### Tip Jar
- Send tips to creators on their posts
- Preset amounts ($1, $2, $5, $10, $20)
- Optional message with tip
- Tip notifications

### Marketplace
- List AI art for sale as:
  - **Digital downloads** - Downloadable files
  - **Print-on-demand** - Physical prints with configurable options
- Listing management (title, description, price, active/inactive)
- Order system with status tracking (pending, paid, processing, shipped, delivered, cancelled, refunded)
- Buyer and seller views
- Search marketplace listings

---

## Content Safety

### Safety Preferences
- Toggle visibility of sensitive and mature content
- NSFW blur toggle
- Age verification

### Content Labeling
- AI-powered content classification (safe, sensitive, mature, NSFW)
- AI confidence scores
- Manual override by moderators
- Content warning overlays

### Community Ratings
- Users can rate content safety levels
- Crowd-sourced content moderation

---

## Creator Tools

### Post Insights & Analytics
- View count (total and unique viewers)
- Like, comment, save counts
- Source breakdown (feed, profile, explore, hashtag, search, share)
- Per-post analytics screen

### Scheduled Posts
- Schedule posts for future publication
- Draft mode for work-in-progress posts
- Manage scheduled posts list

### Profile Customization
- Custom profile theme colors and layout
- Interest tags
- Top friends display
- Music/audio profile section

---

## Integration & Quality

### End-to-End Feature Wiring
All features are fully wired from screen → hook → service → database:
- Feed toggles (like, save, reaction) update both optimistic UI and backend
- Post creation flows through audience filtering, challenge entry, streak updates, and badge awards
- Engagement signals (likes, saves) feed the taste profile for personalized recommendations
- Activity status heartbeat runs from the root app layout
- Privacy enforcement: all follow-dependent queries filter by `status = 'accepted'`

### Error Handling & Memory Safety
- All optimistic UI updates include error revert on failure
- Voice recorder/player hooks clean up on unmount (no mic/audio leaks)
- Debounce timers and polling intervals cleaned up via useEffect teardown
- Upsert operations use `onConflict` to prevent duplicate constraint errors

---

## Technical Architecture

### Frontend
- **Framework:** React Native 0.76.3 with Expo 52
- **Navigation:** Expo Router 4 (file-based routing)
- **State:** React hooks (48 custom hooks) + context providers
- **Animations:** React Native Reanimated
- **UI:** Custom component library with dark/light theme system
- **Images:** expo-image with caching and contentFit

### Backend
- **Database:** Supabase (PostgreSQL) with Row Level Security on all tables
- **Auth:** Supabase Auth with session management and follow request privacy
- **Storage:** Supabase Storage for media files (avatars, posts, stories, voice)
- **Edge Functions:** 8 Deno serverless functions
- **Realtime:** Supabase Realtime for messaging and activity status

### AI Providers
- **Replicate** — Flux Schnell, Flux Dev, SDXL 1.0, SD3 (paid)
- **Hugging Face** — Stable Diffusion 2.1 Inference API (free)
- **CLIP** — Visual embeddings for similarity search (pgvector)

### Codebase Stats
- **67+ screens** across 5 tab groups and stack navigators
- **55 service files** handling all Supabase interactions
- **48 custom hooks** for state management and UI logic
- **100+ components** organized by feature domain
- **34 SQL migrations** with full RLS policies
- **5 RPC functions** (suggested users, post insights, similar posts, personalized feed, blend feed)
- **2 materialized views** for trending prompts and styles
- **0 TypeScript errors** — fully type-safe codebase

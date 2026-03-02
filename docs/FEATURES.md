# Artigen - Complete Feature Documentation

This document describes the full product surface currently present in the Artigen codebase.
Updated: 2026-03-02.

Status labels used in this doc:
- `Implemented` - Feature is wired in app screens/hooks/services and has backend support.
- `Partial` - UI/flow exists but includes placeholders, mock integrations, or limited backend behavior.
- `In Progress` - Data model and/or service wiring exists, but end-to-end behavior is intentionally incomplete.

---

## 1. Core Product Experience

### Feed and Posting (`Implemented`)
- Infinite-scroll home feed with pull-to-refresh and pagination.
- Post types: image, video, carousel, and reels.
- Rich post cards with creator identity, caption, hashtags, location, and engagement actions.
- Story bar integrated at top of home feed.
- Daily challenge card integrated in feed when active.

### Navigation and Routing (`Implemented`)
- Expo Router app architecture with tab, stack, modal, and grouped route segments.
- Main tabs: Home, Search, Create, Reels, Profile.
- Deep-linkable feature routes for content details, creator tools, and AI utilities.

### Authentication and Profile Foundation (`Implemented`)
- Supabase email/password authentication.
- Session bootstrap and auth state synchronization.
- Profile auto-ensure behavior when auth user exists but profile row is missing.
- Sign in, sign up, password reset, sign out flows.

---

## 2. AI Creation Studio

### Text-to-Image Generation (`Implemented`)
- Multi-model generation flow with model-aware defaults and settings.
- Prompt and negative prompt support.
- Adjustable generation controls (steps, guidance, seed, aspect ratio).
- Post creation handoff from generated outputs.

### Advanced Image Editing Tools
- Restyle / style transfer (`Implemented`, backend `Partial`): style presets + custom prompt transform flow.
- Inpainting (`Implemented`): mask-based selective replacement.
- Outpainting (`Implemented`): directional canvas expansion.
- Upscaling (`Implemented`): enhancement with selectable scale factors.
- ControlNet (`Implemented`): control types, presets, prompt-guided generation.
- Remix (`Implemented`): generate from another post's AI metadata with attribution.

### Motion and 3D Tools
- Image animation (`Implemented`, backend `Partial`): animation jobs and result posting.
- Text-to-3D (`Implemented`): prompt to 3D job flow with preview thumbnail/model URL.
- AR preview (`Partial`): configurable framing/dimensions and simulated preview UI.

### Creative Assistance
- Prompt library (`Implemented`): save/use/search/share prompts.
- Prompt remix editor (`Implemented`): modify existing prompt with tracked relationship.
- AI caption generation (`Implemented`): assisted caption draft flow.
- Avatar generation (`Implemented`, auth wiring `Partial`): selfie-based style avatar generation jobs.
- AI music generation (`Implemented`): prompt-based music generation screen and service flow.
- Art coach critique generation (`Implemented`, model quality `Partial`): AI-generated structured critique workflows.
- Comic generation studio (`Implemented`): multi-panel comic composition helpers.
- Art genetics / breeding (`Implemented`, experimental): combine parent artworks into generated offspring variants.
- Ambient generation mode (`Implemented`, experimental): interval-driven automated generation sessions.

### AI Provenance and Integrity
- Provenance record creation and storage (`Implemented`).
- C2PA-style metadata and verification status rendering (`Implemented`).
- Provenance badge and detail screen (`Implemented`).

---

## 3. Publishing and Media Management

### Post Composer (`Implemented`)
- New post flow with media selection, caption, metadata, and audience controls.
- New reel flow with dedicated creation route.
- New story flow and story-specific publishing settings.

### Publishing Controls (`Implemented`)
- Audience selection (everyone vs close friends where applicable).
- Draft and scheduled publishing support.
- Location metadata support.
- AI metadata attachment support on publish.

### Organization (`Implemented`)
- Saved posts and custom collections.
- Pinned posts on profile.
- Profile post grid and collection browsing.

---

## 4. Social Graph and Engagement

### Follow Graph (`Implemented`)
- Follow/unfollow.
- Private account follow request flow.
- Followers/following list screens.
- Suggested users powered by backend RPC.

### Post Engagement (`Implemented`)
- Likes with optimistic updates.
- Emoji reactions.
- Comments and replies.
- Comment likes and pinned comments.
- Critiques and helpful-vote interactions.
- Saves to collections.
- Reposts.
- Poll voting on posts.
- Awarding system on posts.
- Tip actions on posts.

### Collaboration and Remix Culture (`Implemented`)
- Collaborative post invite flow.
- Remix attribution chain and remixes gallery.
- "More like this" and similarity-driven interaction entry points.

### User Protection and Trust (`Implemented`)
- User block/unblock.
- Reporting UI and report submission flow.
- Safety labels and provenance badges surfaced on feed cards.

### Social Utilities (`Implemented`)
- Close friends list management screen and exclusive audience sharing support.
- Notification center with unread state, mark-read, and mark-all-read actions.

---

## 5. Stories

### Story Creation and Viewing (`Implemented`)
- Story creation route with media support.
- Story viewer with user-based story navigation.
- Story replies routed into messaging.
- Story bar and close-friends ring support.

### Interactive Story Stickers (`Implemented`)
- Poll sticker.
- Quiz sticker.
- Question sticker.
- Emoji slider sticker.
- Countdown sticker.
- Link sticker.
- Sticker tray and overlay composition system.

### Story Lifecycle (`Implemented`)
- 24-hour expiry model.
- Close friends story audience support.
- Highlight surfaces in profile UI.

---

## 6. Messaging and Presence

### DM and Group Messaging (`Implemented`)
- 1:1 and group conversation support.
- Conversation list, conversation detail, new message, and new group routes.
- Message reactions and rich message bubbles.

### Rich Messaging Features (`Implemented`)
- Voice recording and voice message playback.
- Vanish mode toggle.
- Notes row/composer for ephemeral note status.
- Blend feed integration inside messaging.
- Desktop-responsive messaging layout components.

### Presence and Activity (`Implemented`)
- Activity status tracking and heartbeat updates.
- Online indicator components.

---

## 7. Discovery and Search

### Explore and Search (`Implemented`)
- Search across users, hashtags, posts, communities, and prompts.
- Explore masonry grid.
- Trending surface routes.
- Hashtag and location result pages.

### Visual Discovery (`Implemented`)
- Visual search route for image-based similarity queries.
- CLIP-embedding based related content infrastructure.

### Personalization (`Implemented`)
- Taste profile capture and editing.
- Engagement signal tracking for recommendation input.
- Blend feed personalization between users.

---

## 8. Community, Events, and Competitive Layers

### Communities (`Implemented`)
- Community discovery, creation, and detail screens.
- Public/private community model.
- Membership and role-aware behavior.
- Community-scoped content display.

### Events (`Implemented`)
- Events listing with status filtering.
- Event creation flow (type, schedule, meeting URL).
- Event detail pages and attendance interactions.

### Exhibitions (`Implemented`)
- Exhibition listing and filtering.
- Exhibition creation and submission flows.
- Exhibition detail with gallery-style content.

### Challenges and Weekly Events (`Implemented`)
- Daily challenge participation and submission.
- Challenge detail/history views.
- Weekly event leaderboard and voting experience.

### Art Battles (`Implemented`)
- Battle creation with theme and time-limit setup.
- Battle detail and arena UI.
- Community voting and countdown/timer support.
- Battle finalization function in backend.

---

## 9. Learning, XP, and Mentorship

### Tutorials and Lessons (`Implemented`)
- Tutorials index with category filtering.
- Tutorial detail with lesson list and progress.
- Lesson execution routes with content types (text/quiz/interactive/practice).

### XP and Progression (`Implemented`)
- XP accumulation and level progression.
- XP bar and reward toast components.
- Lesson completion XP awarding.

### Mentorship (`Implemented`)
- Mentorship list and detail views.
- Mentor discovery flow.
- Mentorship request flow and mentor response actions.
- Session/feedback tracking surfaces.

---

## 10. Monetization

### Creator Subscriptions (`Implemented`)
- Tier management.
- Creator subscription screen and gated content UI.
- Subscriber badge and tier presentation components.

### Wallet and Tips (`Implemented`, rails `Partial`)
- Wallet balance and transaction history.
- Tip transfer flow via edge function and ledger transactions.
- Wallet deposit and withdraw screens exist but payment/payout rails are `In Progress`.

### Marketplace (`Implemented`, payments `Partial`)
- Listing creation and listing detail pages.
- Digital download and print-on-demand listing types.
- Buyer order creation and order detail/status tracker.
- Seller/buyer order list views.
- Payment capture/checkout hardening is `In Progress`.

---

## 11. Safety and Moderation

### Safety Preferences (`Implemented`)
- User safety settings UI.
- Content preference controls.

### Content Labeling (`Implemented`, classifier integration `Partial`)
- Safety labels in feed and post UI.
- Content warning overlays.
- Safety check edge function present; external classifier wiring is partially placeholder-based.

### Reporting and Governance (`Implemented`)
- Reporting service and report sheet UI.
- Community moderation support through roles and visibility controls.

---

## 12. Cross-Platform and Growth Features

### Cross-Posting (`Implemented`, provider auth `Partial`)
- Connect social account stubs/settings.
- Platform selection and cross-post execution status tracking.
- Current account connection UX is username-based; full OAuth provider integration is `In Progress`.

### Sticker Packs (`Implemented`)
- Sticker pack browse, saved, and "my packs" tabs.
- Sticker pack creation and per-pack sticker management.
- Sticker picker integration for story composition and chat surfaces.

### Web Runtime Support (`Implemented`)
- Web-specific storage/upload support.
- PWA manifest/service worker assets in `public/`.
- Web notifications hook support.

### Future Labs (`Implemented`, feature-flagged)
- Future Labs hub route with staged rollout cards.
- Transparency Center scaffold.
- Localization Studio scaffold.
- Spatial Gallery scaffold.
- Director Mode scaffold.
- Client-side feature flag and telemetry foundation for phased launches.

---

## 13. Creator Utility and Insights

### Post Analytics (`Implemented`)
- View, unique viewer, likes, comments, saves, and source breakdown aggregation.
- Per-post insights route.

### Scheduling and Workflow Automation (`Implemented`)
- Scheduled posts management.
- Workflow template creation, discovery, saving, and execution.
- Multi-step workflow run progress, pause/resume controls.

### Profile Customization (`Implemented`)
- Profile theme customization.
- Interest tags.
- Profile music settings.
- Custom portfolio editing and publishing.

---

## 14. Backend Capability Surface

### Supabase Edge Functions (18)
- `generate`, `restyle`, `inpaint`, `outpaint`, `upscale`, `controlnet`, `animate`
- `text-to-3d`, `generate-avatar`, `generate-music`
- `embed-image`, `safety-check`, `sign-provenance`
- `process-tip`, `cross-post`, `daily-challenge`, `battle-finalize`, `art-coach`

### Service Layer Domains
- Social graph and interactions: follow, comments, reactions, reposts, polls, awards.
- Creator economy: subscription, wallet, tips, marketplace, orders.
- AI stack: generation, restyle, in/outpaint, upscale, controlnet, animation, avatar, music, 3D.
- Experimental AI creation: art coaching, comic generation, art genetics, ambient creation loops.
- Discovery and personalization: explore, trending, similarity, taste profile, suggestions.
- Collaboration and community: communities, mentorship, workflows, events, exhibitions, battles.
- Future rollout foundation: feature flags, telemetry events, and future-labs service contracts.

---

## 15. Implementation Notes (Important)

These features are present in code but currently not fully production-complete end-to-end:
- Wallet deposit and withdrawal external payment rails (`In Progress`).
- Cross-post account connection currently uses simplified/manual connect UX (`In Progress`).
- AR preview is a simulated AR experience, not full live camera ARKit/ARCore (`Partial`).
- Some AI edge functions include provider placeholders/fallback behavior (`Partial`).
- Critique and avatar-related routes include remaining mock-auth user IDs in specific screens (`In Progress`).
- Experimental routes (ambient/comic/art-genetics/future-labs) are early-stage and may change rapidly (`In Progress`).

---

## 16. Route Coverage Snapshot

Primary route groups and feature scope:
- `src/app/(tabs)` - feed, search/discovery, create entry points, reels, profile.
- `src/app/(camera)` - all creation pipelines: generate, remix, restyle, inpaint, outpaint, upscale, animate, controlnet.
- `src/app/(messages)` - inbox, conversations, new DM, new group.
- `src/app/(stories)` - story viewing and story interaction.
- `src/app/(screens)` - advanced social, creator tools, monetization, community, events, learning, marketplace, safety, utility routes, and experimental/future labs surfaces.

This file is intended to be the canonical product feature map for the current repository state.

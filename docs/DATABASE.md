# Artigen - Database and Backend Reference

Updated: 2026-03-02

This document summarizes the current Supabase database + backend surface in this repository.

## 1. Migration Inventory

Apply migrations in filename order from `migrations/`.

| Order | File | Scope |
|---:|---|---|
| 001 | `001_comment_likes_and_pinned.sql` | Comment likes, pinned comments, message reactions, blocks/reports, highlights |
| 002 | `002_post_reactions.sql` | Post emoji reactions |
| 003 | `003_collections.sql` | Collections and saved organization |
| 004 | `004_close_friends.sql` | Close friends list |
| 005 | `005_activity_status.sql` | Activity/online status |
| 006 | `006_voice_messages.sql` | Voice messages in DMs |
| 007 | `007_vanish_mode.sql` | Vanish mode / ephemeral message cleanup |
| 008 | `008_story_stickers.sql` | Story stickers + responses |
| 009 | `009_collaborative_posts.sql` | Post collaborators |
| 010 | `010_post_insights.sql` | Post views + insights helpers |
| 011 | `011_scheduled_posts.sql` | Scheduled/draft publishing |
| 012 | `012_profile_customization.sql` | Profile custom themes/top friends |
| 013 | `013_locations.sql` | Location entities and counts |
| 014 | `014_remix_and_prompts.sql` | Prompt library and saves |
| 015 | `015_creator_subscriptions.sql` | Subscription tiers and subscriptions |
| 016 | `016_reposts_and_polls.sql` | Reposts and polls |
| 017 | `017_marketplace.sql` | Marketplace listings and orders |
| 018 | `018_communities.sql` | Communities and memberships |
| 019 | `019_streaks.sql` | User streaks |
| 020 | `020_awards_and_leaderboard.sql` | Award types and post awards |
| 021 | `021_communities.sql` | Community posts enhancements |
| 022 | `022_challenges.sql` | Extended challenges + creation streaks |
| 023 | `023_blend_feed.sql` | Blend feeds and blend ranking function |
| 024 | `024_style_transfer.sql` | Style presets and restyle jobs |
| 025 | `025_image_animation.sql` | Animation jobs |
| 026 | `026_prompt_remix.sql` | Prompt remix chains |
| 027 | `027_provenance.sql` | Art provenance records |
| 028 | `028_content_safety.sql` | Content labels, ratings, safety preferences |
| 029 | `029_ai_creation_tools.sql` | Inpaint/outpaint/upscale/controlnet jobs + presets |
| 030 | `030_art_battles.sql` | Art battles, entries, votes |
| 031 | `031_prompt_chains.sql` | Workflow templates, runs, saves |
| 032 | `032_learning_system.sql` | Tutorials, lessons, progress, XP, mentorship |
| 033 | `033_events_exhibitions.sql` | Events, exhibitions, weekly events |
| 034 | `034_critiques_avatars.sql` | Critiques, helpful votes, avatar jobs/avatars |
| 035 | `035_content_enhancement.sql` | Music jobs, sticker packs/stickers, text-to-3d jobs |
| 036 | `036_platform_growth.sql` | Portfolio, cross-posting, AR preview settings |
| 037 | `037_future_foundation.sql` | Future-facing foundation schema |
| 038 | `038_performance_and_security.sql` | Performance and security hardening |
| 039 | `039_generation_history.sql` | Generation history and provenance follow-ons |
| 040 | `040_engagement_credits.sql` | Engagement credits ledger |
| 041 | `041_wallet_safety.sql` | Wallet safety protections |
| 042 | `042_engagement_credits_atomicity.sql` | Atomicity fixes for engagement credits |
| 043 | `043_notification_rls_fix.sql` | Notification RLS fix |
| 044 | `044_engagement_rewards_dedup.sql` | Engagement reward deduplication |
| 045 | `045_daily_challenges.sql` | Daily challenges and votes |
| 046 | `046_wallet_and_tips.sql` | Wallets, wallet transactions, tips |
| 047 | `047_notes_and_badges.sql` | Notes and badges |
| 048 | `048_visual_similarity.sql` | Post embeddings and similarity search |
| 049 | `049_taste_profile.sql` | Taste profiles + engagement signals |
| 050 | `050_trending_prompts.sql` | Trending materialized views + refresh function |

Total migrations: **50**.

## 2. Core Schema Domains

Base/core social tables are defined in `supabase-schema.sql` and extended by migrations.

### 2.1 Core Social and Identity
- `profiles`
- `follows`
- `posts`
- `post_media`
- `likes`
- `comments`
- `comment_likes`
- `stories`
- `story_views`
- `hashtags`
- `post_hashtags`
- `saved_posts`
- `conversations`
- `conversation_participants`
- `messages`
- `notifications`

### 2.2 Interaction and Safety Extensions
- `post_reactions`
- `message_reactions`
- `reposts`
- `post_polls`, `poll_options`, `poll_votes`
- `post_awards`, `award_types`
- `reports`
- `user_blocks`
- `content_labels`, `content_ratings`, `safety_preferences`

### 2.3 Story/Media Extensions
- `story_stickers`, `story_sticker_responses`
- `story_highlights`, `story_highlight_items`

### 2.4 Creation/AI Metadata
- `ai_metadata`
- `prompt_library`, `prompt_saves`, `prompt_remixes`
- `post_embeddings`
- `art_provenance`
- `style_presets`, `restyle_jobs`
- `animation_jobs`
- `inpainting_jobs`, `outpainting_jobs`, `upscaling_jobs`, `controlnet_jobs`, `controlnet_presets`
- `text_to_3d_jobs`
- `avatar_generation_jobs`, `user_avatars`
- `music_generation_jobs`

### 2.5 Discovery, Personalization, and Growth
- `taste_profiles`
- `engagement_signals`
- `post_views`
- `user_streaks`, `creation_streaks`
- `daily_challenges`, `challenge_entries`, `challenge_votes`
- `challenges`
- `badges`, `user_badges`
- `blend_feeds`

### 2.6 Communities and Collaboration
- `communities`, `community_members`, `community_posts`
- `post_collaborators`

### 2.7 Creator Economy
- `subscription_tiers`, `subscriptions`
- `wallets`, `wallet_transactions`, `tips`
- `marketplace_listings`, `orders`

### 2.8 Learning and Mentorship
- `tutorials`, `tutorial_lessons`, `user_tutorial_progress`
- `user_xp`, `xp_transactions`
- `mentorships`, `mentorship_sessions`

### 2.9 Events, Competitive Systems, and Showcases
- `events`, `event_attendees`
- `exhibitions`, `exhibition_submissions`, `exhibition_visits`
- `weekly_events`, `weekly_event_entries`, `weekly_event_votes`
- `art_battles`, `battle_entries`, `battle_votes`

### 2.10 Platform Growth and Publishing Utilities
- `collections`
- `locations`
- `profile_top_friends`
- `user_notes`
- `portfolio_sections`, `portfolio_items`
- `cross_post_accounts`, `cross_posts`
- `ar_previews`

## 3. RPC / SQL Functions

Current notable SQL functions created via migrations:
- `get_suggested_users(current_user_id, result_limit)`
- `get_post_insights(target_post_id)`
- `search_similar_posts(query_embedding, threshold, count, exclude_id)`
- `get_personalized_feed(target_user_id, offset, limit)`
- `get_blend_feed(blend_id, offset, limit)`
- `refresh_trending()`

Plus trigger helpers for sync/count maintenance, including:
- `sync_reaction_count`
- `sync_views_count`
- `sync_collection_count`
- `sync_location_count`
- `update_subscriber_count`
- `cleanup_ephemeral_messages`
- `handle_comment_like_count`

## 4. Materialized Views

- `trending_prompts`
- `trending_styles`

Refreshed through `refresh_trending()`.

## 5. Supabase Edge Functions (17)

Functions in `supabase/functions/`:
1. `animate`
2. `battle-finalize`
3. `controlnet`
4. `cross-post`
5. `daily-challenge`
6. `embed-image`
7. `generate`
8. `generate-avatar`
9. `generate-music`
10. `inpaint`
11. `outpaint`
12. `process-tip`
13. `restyle`
14. `safety-check`
15. `sign-provenance`
16. `text-to-3d`
17. `upscale`

## 6. Known Backend Integration Notes

Current implementation details to be aware of:
- `restyle`, `animate`, `embed-image`, and `safety-check` include placeholder external provider endpoints in function code.
- Wallet deposit/withdraw UI exists, but external payment/payout rails are still incomplete.

## 7. Operational Guidance

- Keep migrations additive and idempotent (`IF NOT EXISTS`, guarded updates).
- Apply migrations in strict filename order for deterministic environments.
- Follow the migration apply, rollback, and recovery runbook in `docs/MIGRATIONS.md`.
- Validate RLS policies whenever adding a new table or changing access patterns.
- Keep `src/types/database.ts` aligned with live schema after migration updates.

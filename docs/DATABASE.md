# Artigen - Database Schema Reference

All tables use Supabase (PostgreSQL) with Row Level Security (RLS) enabled.

---

## Migrations

Run migrations in order in the Supabase SQL Editor. There are two migration tracks that should be applied sequentially:

### Track A: Core Social Features (apply first)
| # | File | Description |
|---|------|-------------|
| 001 | `001_comment_likes_and_pinned.sql` | Comment likes and pinned comments |
| 002 | `002_post_reactions.sql` | Emoji reactions on posts |
| 003 | `003_collections.sql` | Saved post collections |
| 004 | `004_close_friends.sql` | Close friends list |
| 005 | `005_activity_status.sql` | User online/activity status |
| 006 | `006_voice_messages.sql` | Voice message support in DMs |
| 007 | `007_vanish_mode.sql` | Disappearing messages |
| 008 | `008_story_stickers.sql` | Interactive story stickers |
| 009 | `009_collaborative_posts.sql` | Post collaboration system |
| 010 | `010_post_insights.sql` | Post analytics and insights |
| 011 | `011_scheduled_posts.sql` | Scheduled/draft posts |
| 012 | `012_profile_customization.sql` | Profile themes and customization |
| 013 | `013_locations.sql` | Location tagging |

### Track B: AI Art & Social Features
| # | File | Description |
|---|------|-------------|
| 014 | `014_remix_and_prompts.sql` | AI art remixes and prompt library |
| 015a | `015_daily_challenges.sql` | Daily creative challenges |
| 015b | `015_creator_subscriptions.sql` | Creator subscription tiers |
| 016a | `016_reposts_and_polls.sql` | Reposting and post polls |
| 016b | `016_wallet_and_tips.sql` | Wallet system and tips |
| 017a | `017_notes_and_badges.sql` | User notes and achievement badges |
| 017b | `017_marketplace.sql` | Digital marketplace |
| 018a | `018_communities.sql` | Communities / art groups |
| 018b | `018_visual_similarity.sql` | Visual similarity search (pgvector) |
| 019a | `019_streaks.sql` | Posting streaks |
| 019b | `019_taste_profile.sql` | Taste profiles and engagement signals |
| 020a | `020_awards_and_leaderboard.sql` | Awards and leaderboard |
| 020b | `020_trending_prompts.sql` | Trending prompts (materialized views) |

### Track C: Advanced AI & Community Features
| # | File | Description |
|---|------|-------------|
| 021 | `021_communities.sql` | Community posts, pinned posts, custom reactions |
| 022 | `022_challenges.sql` | Extended challenge features and creation streaks |
| 023 | `023_blend_feed.sql` | Blend feed (shared feeds between users) |
| 024 | `024_style_transfer.sql` | Style transfer presets and jobs |
| 025 | `025_image_animation.sql` | Image animation jobs |
| 026 | `026_prompt_remix.sql` | Prompt remix tracking |
| 027 | `027_provenance.sql` | Art provenance and signing |
| 028 | `028_content_safety.sql` | Content safety labels and preferences |

**Total: 34 migrations across 3 tracks**

---

## Table Reference

### User & Authentication

#### `profiles`
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid PK | | Matches auth.users.id |
| username | text | | Unique username |
| full_name | text | '' | Display name |
| avatar_url | text | null | Profile photo URL |
| bio | text | '' | User bio |
| website | text | '' | Website URL |
| is_private | boolean | false | Private account |
| is_verified | boolean | false | Verified badge |
| is_creator | boolean | false | Creator account |
| theme_preference | text | 'system' | light/dark/system |
| followers_count | integer | 0 | Follower count |
| following_count | integer | 0 | Following count |
| posts_count | integer | 0 | Post count |
| subscriber_count | integer | 0 | Paid subscriber count |
| push_token | text | null | Push notification token |
| show_activity_status | boolean | true | Show online status |
| last_active_at | timestamptz | now() | Last activity time |
| profile_theme | jsonb | '{}' | Custom profile theme |
| interest_tags | text[] | '{}' | Interest tag list |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |

#### `follows`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| follower_id | uuid FK profiles | Who follows |
| following_id | uuid FK profiles | Who is followed |
| status | text | 'accepted' or 'pending' |
| created_at | timestamptz | |

#### `close_friends`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| user_id | uuid FK profiles | List owner |
| friend_id | uuid FK profiles | Close friend |
| created_at | timestamptz | |

### Posts & Content

#### `posts`
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid PK | | |
| user_id | uuid FK profiles | | Post author |
| caption | text | '' | Post caption |
| post_type | text | | image/video/carousel/reel |
| location | text | null | Location name |
| location_id | uuid FK | null | Location reference |
| is_archived | boolean | false | Hidden from profile |
| is_comments_disabled | boolean | false | |
| is_pinned | boolean | false | Pinned to profile |
| pinned_at | timestamptz | null | |
| likes_count | integer | 0 | |
| comments_count | integer | 0 | |
| views_count | integer | 0 | |
| repost_count | integer | 0 | |
| audience | text | 'everyone' | everyone/close_friends |
| scheduled_at | timestamptz | null | Future publish time |
| is_draft | boolean | false | Draft status |
| remix_of_post_id | uuid FK posts | null | Original post if remix |
| community_id | uuid FK communities | null | Community post belongs to |
| has_listing | boolean | false | Has marketplace listing |
| has_provenance | boolean | false | Has provenance record |
| subscription_tier_id | uuid FK | null | Subscriber-only content |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |

#### `post_media`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| post_id | uuid FK posts | |
| media_url | text | File URL |
| media_type | text | image/video |
| width | integer | Pixel width |
| height | integer | Pixel height |
| sort_order | integer | Order in carousel |

### AI Features

#### `ai_metadata`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| post_id | uuid FK posts | |
| model_id | text | AI model identifier |
| model_name | text | Display name |
| prompt | text | Generation prompt |
| negative_prompt | text | Negative prompt |
| settings | jsonb | Steps, guidance, seed, etc. |
| style_tags | text[] | Style categories |
| generation_time_ms | integer | Generation duration |

#### `prompt_library`
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid PK | | |
| user_id | uuid FK profiles | | Creator |
| title | text | | Prompt title |
| prompt | text | | Full prompt text |
| negative_prompt | text | '' | Negative prompt |
| model_id | text | | Preferred model |
| model_name | text | | Model display name |
| settings | jsonb | '{}' | Generation settings |
| style_tags | text[] | '{}' | Style categories |
| use_count | integer | 0 | Times used |
| save_count | integer | 0 | Times saved |
| is_public | boolean | true | Publicly visible |
| created_at | timestamptz | now() | |

#### `post_embeddings`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| post_id | uuid FK posts | Unique per post |
| embedding | vector(512) | CLIP embedding |
| model_version | text | 'clip-vit-base-patch32' |

#### `art_provenance`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| post_id | uuid FK posts | Unique per post |
| author_id | uuid FK profiles | |
| content_hash | text | SHA hash of content |
| prompt_hash | text | SHA hash of prompt |
| model_id | text | AI model used |
| generation_date | timestamptz | When generated |
| signature | text | Cryptographic signature |
| c2pa_manifest | jsonb | C2PA metadata |
| verification_status | text | verified/unverified/tampered |

### Engagement

#### `likes`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| user_id | uuid FK profiles | |
| post_id | uuid FK posts | |
| created_at | timestamptz | |

#### `post_reactions`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| user_id | uuid FK profiles | |
| post_id | uuid FK posts | |
| reaction_type | text | like/love/haha/wow/sad/fire/clap |

#### `comments`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| user_id | uuid FK profiles | |
| post_id | uuid FK posts | |
| parent_id | uuid FK comments | null for top-level |
| text | text | Comment text |
| is_pinned | boolean | |
| likes_count | integer | |

#### `reposts`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| user_id | uuid FK profiles | |
| post_id | uuid FK posts | Original post |
| quote_text | text | Optional quote |
| created_at | timestamptz | |

#### `post_polls`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| post_id | uuid FK posts | One poll per post |
| question | text | Poll question |
| ends_at | timestamptz | Optional expiry |

#### `poll_options` / `poll_votes`
Options and votes for post polls with vote_count tracking.

#### `post_awards`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| post_id | uuid FK posts | |
| user_id | uuid FK profiles | Award giver |
| award_type_id | text FK award_types | |

#### `award_types`
| Column | Type | Description |
|--------|------|-------------|
| id | text PK | fire/love/mindblown/masterpiece/diamond/trophy |
| name | text | Display name |
| emoji | text | Award emoji |
| tier | text | bronze/silver/gold/diamond |
| sort_order | integer | |

### Gamification

#### `daily_challenges`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| prompt_theme | text | Challenge theme |
| description | text | Detailed description |
| date | date | One per day (unique) |
| style_suggestion | text | Suggested art style |

#### `challenge_entries` / `challenge_votes`
Challenge submissions and community voting.

#### `badges`
15 pre-seeded badges across creation, AI, engagement, social, challenge, and streak categories.

#### `user_badges`
Tracks which badges each user has earned.

#### `user_streaks`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| user_id | uuid FK profiles | Unique per user |
| current_streak | integer | Consecutive days |
| longest_streak | integer | All-time best |
| last_post_date | date | Last posting date |

### Communities

#### `communities`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| name | text | Community name |
| description | text | |
| avatar_url | text | |
| cover_url | text | |
| owner_id | uuid FK profiles | Creator |
| member_count | integer | |
| is_private | boolean | |
| rules | text[] | Community rules |
| tags | text[] | Category tags |

#### `community_members`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| community_id | uuid FK | |
| user_id | uuid FK | |
| role | text | owner/moderator/member |

### Monetization

#### `subscription_tiers`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| creator_id | uuid FK profiles | |
| name | text | Tier name |
| price_cents | integer | Monthly price |
| benefits | jsonb | Benefit list |
| badge_label | text | Subscriber badge text |
| badge_color | text | Badge color hex |
| max_subscribers | integer | Cap (null = unlimited) |

#### `subscriptions`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| subscriber_id | uuid FK | |
| creator_id | uuid FK | |
| tier_id | uuid FK | |
| status | text | active/cancelled/expired/paused |

#### `wallets`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| user_id | uuid FK | One per user |
| balance_cents | integer | Current balance |
| lifetime_earned_cents | integer | Total earned |
| lifetime_spent_cents | integer | Total spent |

#### `wallet_transactions`
Transaction types: deposit, withdrawal, tip_sent, tip_received, purchase, sale, subscription_payment, subscription_earning.

#### `marketplace_listings`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| post_id | uuid FK posts | Listed post |
| seller_id | uuid FK profiles | |
| listing_type | text | digital_download/print_on_demand |
| title | text | |
| price_cents | integer | |
| is_active | boolean | |
| sales_count | integer | |

#### `orders`
Order statuses: pending, paid, processing, shipped, delivered, cancelled, refunded.

### Safety

#### `content_labels`
AI-generated safety labels per post (safe/sensitive/mature/nsfw).

#### `safety_preferences`
Per-user content visibility preferences.

#### `content_ratings`
Community-sourced content ratings.

---

## RPC Functions

| Function | Args | Returns | Description |
|----------|------|---------|-------------|
| `get_suggested_users` | current_user_id, result_limit | User profiles with mutual count | Find users to follow |
| `get_post_insights` | target_post_id | Analytics record | Post view/engagement data |
| `search_similar_posts` | query_embedding, threshold, count, exclude_id | post_id + similarity score | Visual similarity search |
| `get_personalized_feed` | target_user_id, offset, limit | post_id + relevance score | AI-personalized feed |
| `get_blend_feed` | blend_id, offset, limit | post_id + relevance score | Shared feed between users |
| `refresh_trending` | (none) | void | Refresh trending materialized views |

---

## Edge Functions

| Function | Endpoint | Description |
|----------|----------|-------------|
| `generate` | POST | AI image generation (Replicate + HuggingFace) |
| `restyle` | POST | Style transfer processing |
| `animate` | POST | Image-to-animation |
| `embed-image` | POST | Generate CLIP embeddings |
| `safety-check` | POST | Content moderation |
| `sign-provenance` | POST | Cryptographic signing |
| `process-tip` | POST | Tip payment processing |
| `daily-challenge` | POST | Generate/fetch daily challenge |

---

## Materialized Views

| View | Description | Refresh |
|------|-------------|---------|
| `trending_prompts` | Top prompts by use count and recency | Via `refresh_trending` RPC |
| `trending_styles` | Top style tags by usage | Via `refresh_trending` RPC |

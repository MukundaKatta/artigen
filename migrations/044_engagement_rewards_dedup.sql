-- Migration 044: Fix engagement rewards race condition (claim-engagement-reward edge function)
-- Problem: daily limit check + duplicate check are separate from INSERT,
-- allowing concurrent requests to bypass limits.
-- Solution: Unique indexes to enforce deduplication at the database level.

-- Prevent duplicate daily_login rewards per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_engagement_rewards_daily_dedup
  ON engagement_rewards (user_id, action, (created_at::date))
  WHERE action IN ('daily_login');

-- Prevent duplicate reference-based rewards (like_received for same post, etc.)
CREATE UNIQUE INDEX IF NOT EXISTS idx_engagement_rewards_reference_dedup
  ON engagement_rewards (user_id, action, reference_id)
  WHERE reference_id IS NOT NULL;

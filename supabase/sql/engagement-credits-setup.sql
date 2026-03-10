-- ============================================================
-- Engagement Credits Table Setup
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create the engagement_credits table
CREATE TABLE IF NOT EXISTS engagement_credits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action      text NOT NULL,
  credits     numeric(10,2) NOT NULL DEFAULT 0,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_engagement_credits_user_date
  ON engagement_credits (user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_engagement_credits_user_action
  ON engagement_credits (user_id, action, created_at);

-- 3. RLS policies
ALTER TABLE engagement_credits ENABLE ROW LEVEL SECURITY;

-- Users can read their own engagement credit records
CREATE POLICY engagement_credits_select
  ON engagement_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own engagement credit records
CREATE POLICY engagement_credits_insert
  ON engagement_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Grant access to authenticated users
GRANT SELECT, INSERT ON engagement_credits TO authenticated;

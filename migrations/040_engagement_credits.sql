-- Migration 040: Earn credits through engagement
-- Users earn credits for posting, receiving likes, and daily logins

CREATE TABLE IF NOT EXISTS engagement_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'post_created', 'like_received', 'daily_login', 'streak_bonus'
  credits_earned INTEGER NOT NULL DEFAULT 0,
  reference_id TEXT, -- optional: post_id, like_id, etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_engagement_rewards_user
  ON engagement_rewards(user_id, created_at DESC);

CREATE INDEX idx_engagement_rewards_action_date
  ON engagement_rewards(user_id, action, created_at DESC);

-- RLS: users can only see their own rewards
ALTER TABLE engagement_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY engagement_rewards_select ON engagement_rewards
  FOR SELECT USING (auth.uid() = user_id);

-- Track daily login streaks
CREATE TABLE IF NOT EXISTS login_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_login_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE login_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY login_streaks_select ON login_streaks
  FOR SELECT USING (auth.uid() = user_id);

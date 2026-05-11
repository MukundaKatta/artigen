-- Migration 039: Generation history table for tracking AI-generated images
-- Enables users to review, reuse prompts, and track credit spending

CREATE TABLE IF NOT EXISTS generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  model_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  image_url TEXT NOT NULL,
  generation_time_ms INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_generation_history_user
  ON generation_history(user_id, created_at DESC);

-- RLS: users can only access their own history
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY generation_history_select ON generation_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY generation_history_insert ON generation_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY generation_history_delete ON generation_history
  FOR DELETE USING (auth.uid() = user_id);

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS generation_history_delete ON generation_history;
-- DROP POLICY IF EXISTS generation_history_insert ON generation_history;
-- DROP POLICY IF EXISTS generation_history_select ON generation_history;
-- DROP INDEX IF EXISTS idx_generation_history_user;
-- DROP TABLE IF EXISTS generation_history;

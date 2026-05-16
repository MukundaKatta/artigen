CREATE TABLE IF NOT EXISTS user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_post_date date,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_streaks_user ON user_streaks(user_id);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view streaks" ON user_streaks FOR SELECT USING (true);
CREATE POLICY "Users manage own streak" ON user_streaks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own streak" ON user_streaks FOR UPDATE USING (user_id = auth.uid());

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS "Users update own streak" ON user_streaks;
-- DROP POLICY IF EXISTS "Users manage own streak" ON user_streaks;
-- DROP POLICY IF EXISTS "Anyone can view streaks" ON user_streaks;
-- DROP INDEX IF EXISTS idx_user_streaks_user;
-- DROP TABLE IF EXISTS user_streaks;

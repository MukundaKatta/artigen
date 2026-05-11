-- Profile Customization
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_theme jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interest_tags text[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS profile_top_friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_profile_top_friends_user ON profile_top_friends(user_id);

-- RLS
ALTER TABLE profile_top_friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view top friends" ON profile_top_friends FOR SELECT USING (true);
CREATE POLICY "Users can manage own top friends" ON profile_top_friends FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own top friends" ON profile_top_friends FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own top friends" ON profile_top_friends FOR DELETE USING (auth.uid() = user_id);

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS "Users can delete own top friends" ON profile_top_friends;
-- DROP POLICY IF EXISTS "Users can update own top friends" ON profile_top_friends;
-- DROP POLICY IF EXISTS "Users can manage own top friends" ON profile_top_friends;
-- DROP POLICY IF EXISTS "Anyone can view top friends" ON profile_top_friends;
-- DROP INDEX IF EXISTS idx_profile_top_friends_user;
-- DROP TABLE IF EXISTS profile_top_friends;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS interest_tags;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS profile_theme;

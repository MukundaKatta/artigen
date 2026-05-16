CREATE TABLE IF NOT EXISTS user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL CHECK (char_length(content) <= 60),
  emoji text,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '24 hours',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_notes_user ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_expires ON user_notes(expires_at);

CREATE TABLE IF NOT EXISTS badges (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  threshold integer DEFAULT 1
);

CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id text REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

INSERT INTO badges (id, name, description, icon, category, threshold) VALUES
  ('first_post', 'First Spark', 'Created your first post', 'sparkles', 'creation', 1),
  ('ten_posts', 'Prolific Creator', 'Created 10 posts', 'flame', 'creation', 10),
  ('fifty_posts', 'Art Machine', 'Created 50 posts', 'rocket', 'creation', 50),
  ('first_ai', 'AI Pioneer', 'Generated your first AI image', 'flash', 'ai', 1),
  ('ten_ai', 'Prompt Master', 'Generated 10 AI images', 'color-palette', 'ai', 10),
  ('hundred_likes', 'Rising Star', 'Received 100 likes', 'star', 'engagement', 100),
  ('thousand_likes', 'Superstar', 'Received 1000 likes', 'trophy', 'engagement', 1000),
  ('first_remix', 'Remixer', 'Created your first remix', 'git-branch', 'social', 1),
  ('ten_remixes', 'Remix Legend', 'Created 10 remixes', 'git-merge', 'social', 10),
  ('first_challenge', 'Challenger', 'Entered your first daily challenge', 'flag', 'challenge', 1),
  ('challenge_winner', 'Champion', 'Won a daily challenge', 'medal', 'challenge', 1),
  ('seven_day_streak', 'Week Warrior', '7-day posting streak', 'calendar', 'streak', 7),
  ('thirty_day_streak', 'Monthly Master', '30-day posting streak', 'infinite', 'streak', 30),
  ('hundred_followers', 'Community Builder', 'Reached 100 followers', 'people', 'social', 100),
  ('first_collab', 'Team Player', 'Created a collaborative post', 'hand-left', 'social', 1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notes visible to all" ON user_notes FOR SELECT USING (true);
CREATE POLICY "Users can create notes" ON user_notes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete notes" ON user_notes FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Anyone can view user badges" ON user_badges FOR SELECT USING (true);
CREATE POLICY "System inserts badges" ON user_badges FOR INSERT WITH CHECK (user_id = auth.uid());

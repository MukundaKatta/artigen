-- Critiques
CREATE TABLE IF NOT EXISTS post_critiques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  composition_rating integer CHECK (composition_rating BETWEEN 1 AND 5),
  color_rating integer CHECK (color_rating BETWEEN 1 AND 5),
  technique_rating integer CHECK (technique_rating BETWEEN 1 AND 5),
  prompt_craft_rating integer CHECK (prompt_craft_rating BETWEEN 1 AND 5),
  originality_rating integer CHECK (originality_rating BETWEEN 1 AND 5),
  overall_rating integer CHECK (overall_rating BETWEEN 1 AND 5),
  feedback_text text NOT NULL,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS critique_helpful_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  critique_id uuid REFERENCES post_critiques(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(critique_id, user_id)
);

-- AI Avatars
CREATE TABLE IF NOT EXISTS avatar_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  source_image_urls text[] NOT NULL,
  style text NOT NULL CHECK (style IN ('anime','cartoon','3d','pixel','watercolor','oil_painting','cyberpunk','fantasy','minimalist','pop_art')),
  prompt_modifier text,
  result_urls text[] DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS user_avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  style text NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_post_critiques_post ON post_critiques(post_id);
CREATE INDEX idx_post_critiques_user ON post_critiques(user_id);
CREATE INDEX idx_critique_helpful_critique ON critique_helpful_votes(critique_id);
CREATE INDEX idx_avatar_jobs_user ON avatar_generation_jobs(user_id);
CREATE INDEX idx_user_avatars_user ON user_avatars(user_id);

-- RLS
ALTER TABLE post_critiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE critique_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view critiques" ON post_critiques FOR SELECT USING (true);
CREATE POLICY "Users create critiques" ON post_critiques FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own critiques" ON post_critiques FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users delete own critiques" ON post_critiques FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Anyone can view helpful votes" ON critique_helpful_votes FOR SELECT USING (true);
CREATE POLICY "Users vote helpful" ON critique_helpful_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users unvote helpful" ON critique_helpful_votes FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users view own avatar jobs" ON avatar_generation_jobs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create avatar jobs" ON avatar_generation_jobs FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users view own avatars" ON user_avatars FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users manage avatars" ON user_avatars FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update avatars" ON user_avatars FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users delete avatars" ON user_avatars FOR DELETE USING (user_id = auth.uid());

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS "Users delete avatars" ON user_avatars;
-- DROP POLICY IF EXISTS "Users update avatars" ON user_avatars;
-- DROP POLICY IF EXISTS "Users manage avatars" ON user_avatars;
-- DROP POLICY IF EXISTS "Users view own avatars" ON user_avatars;
-- DROP POLICY IF EXISTS "Users create avatar jobs" ON avatar_generation_jobs;
-- DROP POLICY IF EXISTS "Users view own avatar jobs" ON avatar_generation_jobs;
-- DROP POLICY IF EXISTS "Users unvote helpful" ON critique_helpful_votes;
-- DROP POLICY IF EXISTS "Users vote helpful" ON critique_helpful_votes;
-- DROP POLICY IF EXISTS "Anyone can view helpful votes" ON critique_helpful_votes;
-- DROP POLICY IF EXISTS "Users delete own critiques" ON post_critiques;
-- DROP POLICY IF EXISTS "Users update own critiques" ON post_critiques;
-- DROP POLICY IF EXISTS "Users create critiques" ON post_critiques;
-- DROP POLICY IF EXISTS "Anyone can view critiques" ON post_critiques;
-- DROP INDEX IF EXISTS idx_user_avatars_user;
-- DROP INDEX IF EXISTS idx_avatar_jobs_user;
-- DROP INDEX IF EXISTS idx_critique_helpful_critique;
-- DROP INDEX IF EXISTS idx_post_critiques_user;
-- DROP INDEX IF EXISTS idx_post_critiques_post;
-- DROP TABLE IF EXISTS user_avatars;
-- DROP TABLE IF EXISTS avatar_generation_jobs;
-- DROP TABLE IF EXISTS critique_helpful_votes;
-- DROP TABLE IF EXISTS post_critiques;

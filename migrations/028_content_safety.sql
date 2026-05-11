CREATE TABLE IF NOT EXISTS content_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  label_type text NOT NULL CHECK (label_type IN ('safe','sensitive','mature','nsfw')),
  ai_confidence float,
  ai_categories jsonb DEFAULT '{}',
  is_ai_labeled boolean DEFAULT true,
  is_overridden boolean DEFAULT false,
  override_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_content_labels_post ON content_labels(post_id);

CREATE TABLE IF NOT EXISTS content_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating text NOT NULL CHECK (rating IN ('safe','sensitive','mature','nsfw')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_content_ratings_post ON content_ratings(post_id);

CREATE TABLE IF NOT EXISTS safety_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  show_sensitive boolean DEFAULT false,
  show_mature boolean DEFAULT false,
  blur_nsfw boolean DEFAULT true,
  age_verified boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE content_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content labels visible to all" ON content_labels FOR SELECT USING (true);
CREATE POLICY "System creates labels" ON content_labels FOR INSERT WITH CHECK (true);
CREATE POLICY "Moderators override labels" ON content_labels FOR UPDATE USING (true);

CREATE POLICY "Ratings visible to all" ON content_ratings FOR SELECT USING (true);
CREATE POLICY "Users rate content" ON content_ratings FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users view own safety prefs" ON safety_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users manage own safety prefs" ON safety_preferences FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own safety prefs" ON safety_preferences FOR UPDATE USING (user_id = auth.uid());

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS "Users update own safety prefs" ON safety_preferences;
-- DROP POLICY IF EXISTS "Users manage own safety prefs" ON safety_preferences;
-- DROP POLICY IF EXISTS "Users view own safety prefs" ON safety_preferences;
-- DROP POLICY IF EXISTS "Users rate content" ON content_ratings;
-- DROP POLICY IF EXISTS "Ratings visible to all" ON content_ratings;
-- DROP POLICY IF EXISTS "Moderators override labels" ON content_labels;
-- DROP POLICY IF EXISTS "System creates labels" ON content_labels;
-- DROP POLICY IF EXISTS "Content labels visible to all" ON content_labels;
-- DROP TABLE IF EXISTS safety_preferences;
-- DROP INDEX IF EXISTS idx_content_ratings_post;
-- DROP TABLE IF EXISTS content_ratings;
-- DROP INDEX IF EXISTS idx_content_labels_post;
-- DROP TABLE IF EXISTS content_labels;

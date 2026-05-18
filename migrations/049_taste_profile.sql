CREATE TABLE IF NOT EXISTS taste_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  preferred_styles text[] DEFAULT '{}',
  preferred_models text[] DEFAULT '{}',
  preferred_themes text[] DEFAULT '{}',
  preferred_palettes text[] DEFAULT '{}',
  disliked_styles text[] DEFAULT '{}',
  disliked_themes text[] DEFAULT '{}',
  engagement_weights jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS engagement_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  signal_type text NOT NULL CHECK (signal_type IN ('view','like','save','comment','share','long_view','skip')),
  weight float DEFAULT 1.0,
  style_tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_engagement_user ON engagement_signals(user_id);
CREATE INDEX idx_engagement_created ON engagement_signals(created_at DESC);
CREATE INDEX idx_taste_profiles_user ON taste_profiles(user_id);

CREATE OR REPLACE FUNCTION get_personalized_feed(
  target_user_id uuid,
  page_offset int DEFAULT 0,
  page_limit int DEFAULT 10
)
RETURNS TABLE (post_id uuid, relevance_score float)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  user_styles text[];
  user_themes text[];
BEGIN
  SELECT preferred_styles, preferred_themes
    INTO user_styles, user_themes
    FROM taste_profiles WHERE user_id = target_user_id;

  RETURN QUERY
  SELECT p.id AS post_id,
    COALESCE(
      (SELECT COUNT(*)::float FROM unnest(am.style_tags) t WHERE t = ANY(user_styles)) * 2.0 +
      CASE WHEN am.model_id = ANY(
        (SELECT preferred_models FROM taste_profiles WHERE user_id = target_user_id)
      ) THEN 3.0 ELSE 0.0 END +
      LOG(GREATEST(p.likes_count, 1))
    , 0) AS relevance_score
  FROM posts p
  LEFT JOIN ai_metadata am ON am.post_id = p.id
  WHERE p.is_archived = false
    AND p.subscription_tier_id IS NULL
  ORDER BY relevance_score DESC, p.created_at DESC
  OFFSET page_offset
  LIMIT page_limit;
END;
$$;

ALTER TABLE taste_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own taste profile" ON taste_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users manage own taste profile" ON taste_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own taste profile" ON taste_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System writes engagement signals" ON engagement_signals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users view own signals" ON engagement_signals FOR SELECT USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS blend_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_b_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_a_id, user_b_id)
);

CREATE INDEX idx_blend_feeds_users ON blend_feeds(user_a_id, user_b_id);

CREATE OR REPLACE FUNCTION get_blend_feed(
  blend_id uuid,
  page_offset int DEFAULT 0,
  page_limit int DEFAULT 20
)
RETURNS TABLE (post_id uuid, relevance_score float)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  uid_a uuid;
  uid_b uuid;
BEGIN
  SELECT user_a_id, user_b_id INTO uid_a, uid_b FROM blend_feeds WHERE id = blend_id;
  RETURN QUERY
  SELECT p.id AS post_id,
    (CASE WHEN EXISTS(SELECT 1 FROM likes WHERE user_id IN (uid_a, uid_b) AND post_id = p.id) THEN 5.0 ELSE 0 END +
     CASE WHEN EXISTS(SELECT 1 FROM saved_posts WHERE user_id IN (uid_a, uid_b) AND post_id = p.id) THEN 3.0 ELSE 0 END +
     LOG(GREATEST(p.likes_count, 1))
    ) AS relevance_score
  FROM posts p
  WHERE p.is_archived = false
    AND p.user_id NOT IN (uid_a, uid_b)
    AND p.subscription_tier_id IS NULL
  ORDER BY relevance_score DESC, p.created_at DESC
  OFFSET page_offset LIMIT page_limit;
END;
$$;

ALTER TABLE blend_feeds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own blends" ON blend_feeds FOR SELECT USING (user_a_id = auth.uid() OR user_b_id = auth.uid());
CREATE POLICY "Users create blends" ON blend_feeds FOR INSERT WITH CHECK (user_a_id = auth.uid() OR user_b_id = auth.uid());
CREATE POLICY "Users delete own blends" ON blend_feeds FOR DELETE USING (user_a_id = auth.uid() OR user_b_id = auth.uid());

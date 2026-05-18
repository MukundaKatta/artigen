-- Post Insights / Analytics
CREATE TABLE IF NOT EXISTS post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  viewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  source text DEFAULT 'feed' CHECK (source IN ('feed','profile','explore','hashtag','search','share')),
  viewed_at timestamptz DEFAULT now()
);

CREATE INDEX idx_post_views_post ON post_views(post_id);
CREATE INDEX idx_post_views_viewer ON post_views(viewer_id);

-- Add views_count to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;

-- RPC: get_post_insights
CREATE OR REPLACE FUNCTION get_post_insights(target_post_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_views', (SELECT count(*) FROM post_views WHERE post_id = target_post_id),
    'unique_viewers', (SELECT count(DISTINCT viewer_id) FROM post_views WHERE post_id = target_post_id WHERE viewer_id IS NOT NULL),
    'likes', (SELECT likes_count FROM posts WHERE id = target_post_id),
    'comments', (SELECT comments_count FROM posts WHERE id = target_post_id),
    'saves', (SELECT count(*) FROM saved_posts WHERE post_id = target_post_id),
    'source_breakdown', (
      SELECT jsonb_object_agg(source, cnt) FROM (
        SELECT source, count(*) as cnt FROM post_views WHERE post_id = target_post_id GROUP BY source
      ) s
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger: sync views_count
CREATE OR REPLACE FUNCTION sync_views_count() RETURNS trigger AS $$
BEGIN
  UPDATE posts SET views_count = (SELECT count(*) FROM post_views WHERE post_id = NEW.post_id) WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_views_count
AFTER INSERT ON post_views
FOR EACH ROW EXECUTE FUNCTION sync_views_count();

-- RLS
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Post owners can view insights" ON post_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND user_id = auth.uid())
);
CREATE POLICY "Anyone can insert views" ON post_views FOR INSERT WITH CHECK (true);

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS "Anyone can insert views" ON post_views;
-- DROP POLICY IF EXISTS "Post owners can view insights" ON post_views;
-- DROP TRIGGER IF EXISTS trg_sync_views_count ON post_views;
-- DROP FUNCTION IF EXISTS sync_views_count();
-- DROP FUNCTION IF EXISTS get_post_insights(uuid);
-- ALTER TABLE posts DROP COLUMN IF EXISTS views_count;
-- DROP INDEX IF EXISTS idx_post_views_viewer;
-- DROP INDEX IF EXISTS idx_post_views_post;
-- DROP TABLE IF EXISTS post_views;

-- Collections (Saved Post Folders)
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  cover_url text,
  post_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_collections_user ON collections(user_id);

-- Add collection_id to saved_posts
ALTER TABLE saved_posts ADD COLUMN IF NOT EXISTS collection_id uuid REFERENCES collections(id) ON DELETE SET NULL;

-- Trigger: auto-update collection post_count
CREATE OR REPLACE FUNCTION sync_collection_count() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.collection_id IS NOT NULL THEN
    UPDATE collections SET post_count = (SELECT count(*) FROM saved_posts WHERE collection_id = NEW.collection_id) WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' AND OLD.collection_id IS NOT NULL THEN
    UPDATE collections SET post_count = (SELECT count(*) FROM saved_posts WHERE collection_id = OLD.collection_id) WHERE id = OLD.collection_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.collection_id IS NOT NULL THEN
      UPDATE collections SET post_count = (SELECT count(*) FROM saved_posts WHERE collection_id = OLD.collection_id) WHERE id = OLD.collection_id;
    END IF;
    IF NEW.collection_id IS NOT NULL THEN
      UPDATE collections SET post_count = (SELECT count(*) FROM saved_posts WHERE collection_id = NEW.collection_id) WHERE id = NEW.collection_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_collection_count
AFTER INSERT OR UPDATE OR DELETE ON saved_posts
FOR EACH ROW EXECUTE FUNCTION sync_collection_count();

-- RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own collections" ON collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collections" ON collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections" ON collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON collections FOR DELETE USING (auth.uid() = user_id);

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS "Users can delete own collections" ON collections;
-- DROP POLICY IF EXISTS "Users can update own collections" ON collections;
-- DROP POLICY IF EXISTS "Users can insert own collections" ON collections;
-- DROP POLICY IF EXISTS "Users can view own collections" ON collections;
-- DROP TRIGGER IF EXISTS trg_sync_collection_count ON saved_posts;
-- DROP FUNCTION IF EXISTS sync_collection_count();
-- ALTER TABLE saved_posts DROP COLUMN IF EXISTS collection_id;
-- DROP INDEX IF EXISTS idx_collections_user;
-- DROP TABLE IF EXISTS collections;

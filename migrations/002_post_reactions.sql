-- Post Reactions (Beyond Like) - 7 reaction types
CREATE TABLE IF NOT EXISTS post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like','love','haha','wow','sad','fire','clap')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX idx_post_reactions_post ON post_reactions(post_id);
CREATE INDEX idx_post_reactions_user ON post_reactions(user_id);

-- Trigger: sync posts.likes_count with reaction count
CREATE OR REPLACE FUNCTION sync_reaction_count() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = (SELECT count(*) FROM post_reactions WHERE post_id = NEW.post_id) WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = (SELECT count(*) FROM post_reactions WHERE post_id = OLD.post_id) WHERE id = OLD.post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE posts SET likes_count = (SELECT count(*) FROM post_reactions WHERE post_id = NEW.post_id) WHERE id = NEW.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_reaction_count
AFTER INSERT OR UPDATE OR DELETE ON post_reactions
FOR EACH ROW EXECUTE FUNCTION sync_reaction_count();

-- RLS
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all reactions" ON post_reactions FOR SELECT USING (true);
CREATE POLICY "Users can insert own reactions" ON post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reactions" ON post_reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON post_reactions FOR DELETE USING (auth.uid() = user_id);

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS "Users can delete own reactions" ON post_reactions;
-- DROP POLICY IF EXISTS "Users can update own reactions" ON post_reactions;
-- DROP POLICY IF EXISTS "Users can insert own reactions" ON post_reactions;
-- DROP POLICY IF EXISTS "Users can view all reactions" ON post_reactions;
-- DROP TRIGGER IF EXISTS trg_sync_reaction_count ON post_reactions;
-- DROP FUNCTION IF EXISTS sync_reaction_count();
-- DROP INDEX IF EXISTS idx_post_reactions_user;
-- DROP INDEX IF EXISTS idx_post_reactions_post;
-- DROP TABLE IF EXISTS post_reactions;

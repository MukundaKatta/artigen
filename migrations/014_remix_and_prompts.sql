-- AI Art Remix & Prompt Library
-- Add remix reference to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS remix_of_post_id uuid REFERENCES posts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_posts_remix ON posts(remix_of_post_id) WHERE remix_of_post_id IS NOT NULL;

-- Prompt library (saved/shared prompts)
CREATE TABLE IF NOT EXISTS prompt_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  prompt text NOT NULL,
  negative_prompt text DEFAULT '',
  model_id text,
  model_name text,
  settings jsonb DEFAULT '{}',
  style_tags text[] DEFAULT '{}',
  use_count integer DEFAULT 0,
  save_count integer DEFAULT 0,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prompt_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  prompt_id uuid REFERENCES prompt_library(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, prompt_id)
);

CREATE INDEX IF NOT EXISTS idx_prompt_library_user ON prompt_library(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_library_tags ON prompt_library USING gin (style_tags);
CREATE INDEX IF NOT EXISTS idx_prompt_saves_user ON prompt_saves(user_id);

ALTER TABLE prompt_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public prompts viewable by all" ON prompt_library FOR SELECT USING (is_public OR user_id = auth.uid());
CREATE POLICY "Users can insert own prompts" ON prompt_library FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own prompts" ON prompt_library FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own prompts" ON prompt_library FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Anyone can view saves" ON prompt_saves FOR SELECT USING (true);
CREATE POLICY "Users can save prompts" ON prompt_saves FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unsave prompts" ON prompt_saves FOR DELETE USING (user_id = auth.uid());

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS "Users can unsave prompts" ON prompt_saves;
-- DROP POLICY IF EXISTS "Users can save prompts" ON prompt_saves;
-- DROP POLICY IF EXISTS "Anyone can view saves" ON prompt_saves;
-- DROP POLICY IF EXISTS "Users can delete own prompts" ON prompt_library;
-- DROP POLICY IF EXISTS "Users can update own prompts" ON prompt_library;
-- DROP POLICY IF EXISTS "Users can insert own prompts" ON prompt_library;
-- DROP POLICY IF EXISTS "Public prompts viewable by all" ON prompt_library;
-- DROP INDEX IF EXISTS idx_prompt_saves_user;
-- DROP INDEX IF EXISTS idx_prompt_library_tags;
-- DROP INDEX IF EXISTS idx_prompt_library_user;
-- DROP TABLE IF EXISTS prompt_saves;
-- DROP TABLE IF EXISTS prompt_library;
-- DROP INDEX IF EXISTS idx_posts_remix;
-- ALTER TABLE posts DROP COLUMN IF EXISTS remix_of_post_id;

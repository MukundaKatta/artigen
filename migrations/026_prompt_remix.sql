CREATE TABLE IF NOT EXISTS prompt_remixes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_post_id uuid REFERENCES posts(id) ON DELETE SET NULL NOT NULL,
  remixed_post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  original_prompt text NOT NULL,
  modified_prompt text NOT NULL,
  original_author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  remixer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  changes_description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_prompt_remixes_original ON prompt_remixes(original_post_id);
CREATE INDEX idx_prompt_remixes_author ON prompt_remixes(original_author_id);

ALTER TABLE prompt_remixes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prompt remixes visible to all" ON prompt_remixes FOR SELECT USING (true);
CREATE POLICY "Users create remixes" ON prompt_remixes FOR INSERT WITH CHECK (remixer_id = auth.uid());

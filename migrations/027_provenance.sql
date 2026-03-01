CREATE TABLE IF NOT EXISTS art_provenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  content_hash text NOT NULL,
  prompt_hash text,
  model_id text,
  model_name text,
  generation_date timestamptz NOT NULL,
  signature text NOT NULL,
  c2pa_manifest jsonb,
  verification_status text DEFAULT 'verified' CHECK (verification_status IN ('verified','unverified','tampered')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_provenance_post ON art_provenance(post_id);
CREATE INDEX idx_provenance_hash ON art_provenance(content_hash);
CREATE INDEX idx_provenance_author ON art_provenance(author_id);

ALTER TABLE posts ADD COLUMN IF NOT EXISTS has_provenance boolean DEFAULT false;

ALTER TABLE art_provenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Provenance visible to all" ON art_provenance FOR SELECT USING (true);
CREATE POLICY "System creates provenance" ON art_provenance FOR INSERT WITH CHECK (author_id = auth.uid());

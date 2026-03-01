CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS post_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  embedding vector(512) NOT NULL,
  model_version text DEFAULT 'clip-vit-base-patch32',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_post_embeddings_post ON post_embeddings(post_id);

CREATE OR REPLACE FUNCTION search_similar_posts(
  query_embedding vector(512),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 20,
  exclude_post_id uuid DEFAULT NULL
)
RETURNS TABLE (post_id uuid, similarity float)
LANGUAGE sql STABLE
AS $$
  SELECT pe.post_id, 1 - (pe.embedding <=> query_embedding) AS similarity
  FROM post_embeddings pe
  JOIN posts p ON p.id = pe.post_id
  WHERE p.is_archived = false
    AND (exclude_post_id IS NULL OR pe.post_id != exclude_post_id)
    AND 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
$$;

ALTER TABLE post_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Embeddings readable by all" ON post_embeddings FOR SELECT USING (true);
CREATE POLICY "System inserts embeddings" ON post_embeddings FOR INSERT WITH CHECK (true);

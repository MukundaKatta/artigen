-- Collaborative Posts
CREATE TABLE IF NOT EXISTS post_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_collaborators_post ON post_collaborators(post_id);
CREATE INDEX idx_post_collaborators_user ON post_collaborators(user_id);

-- RLS
ALTER TABLE post_collaborators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view accepted collaborators" ON post_collaborators FOR SELECT USING (true);
CREATE POLICY "Post owners can invite collaborators" ON post_collaborators FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND user_id = auth.uid())
);
CREATE POLICY "Collaborators can update own status" ON post_collaborators FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Post owners can delete collaborators" ON post_collaborators FOR DELETE USING (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND user_id = auth.uid()) OR auth.uid() = user_id
);

CREATE TABLE IF NOT EXISTS reposts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  quote_text text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE posts ADD COLUMN IF NOT EXISTS repost_count integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_reposts_user ON reposts(user_id);
CREATE INDEX IF NOT EXISTS idx_reposts_post ON reposts(post_id);

CREATE TABLE IF NOT EXISTS post_polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  question text NOT NULL,
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES post_polls(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  vote_count integer DEFAULT 0,
  position integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES post_polls(id) ON DELETE CASCADE NOT NULL,
  option_id uuid REFERENCES poll_options(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON poll_votes(poll_id);

ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reposts" ON reposts FOR SELECT USING (true);
CREATE POLICY "Users can repost" ON reposts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unrepost" ON reposts FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Anyone can view polls" ON post_polls FOR SELECT USING (true);
CREATE POLICY "Post owner can create poll" ON post_polls FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM posts WHERE id = post_id AND user_id = auth.uid()));

CREATE POLICY "Anyone can view options" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Poll creator can add options" ON poll_options FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM post_polls p JOIN posts po ON po.id = p.post_id WHERE p.id = poll_id AND po.user_id = auth.uid()));

CREATE POLICY "Anyone can view votes" ON poll_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON poll_votes FOR INSERT WITH CHECK (user_id = auth.uid());

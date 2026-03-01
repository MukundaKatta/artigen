CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_theme text NOT NULL,
  description text,
  date date NOT NULL UNIQUE,
  style_suggestion text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS challenge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES daily_challenges(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vote_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

CREATE TABLE IF NOT EXISTS challenge_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid REFERENCES challenge_entries(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(entry_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_date ON daily_challenges(date);
CREATE INDEX IF NOT EXISTS idx_challenge_entries_challenge ON challenge_entries(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_votes_entry ON challenge_votes(entry_id);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges" ON daily_challenges FOR SELECT USING (true);
CREATE POLICY "Anyone can view entries" ON challenge_entries FOR SELECT USING (true);
CREATE POLICY "Users can submit entries" ON challenge_entries FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Anyone can view votes" ON challenge_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON challenge_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unvote" ON challenge_votes FOR DELETE USING (user_id = auth.uid());

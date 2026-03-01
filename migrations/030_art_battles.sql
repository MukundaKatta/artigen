CREATE TABLE IF NOT EXISTS art_battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  theme text NOT NULL,
  description text,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting','active','voting','completed')),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  opponent_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  winner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  time_limit_minutes integer DEFAULT 15,
  voting_ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS battle_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid REFERENCES art_battles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  image_url text,
  prompt_used text,
  vote_count integer DEFAULT 0,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(battle_id, user_id)
);

CREATE TABLE IF NOT EXISTS battle_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid REFERENCES art_battles(id) ON DELETE CASCADE NOT NULL,
  entry_id uuid REFERENCES battle_entries(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(battle_id, user_id)
);

CREATE INDEX idx_art_battles_status ON art_battles(status);
CREATE INDEX idx_art_battles_creator ON art_battles(creator_id);
CREATE INDEX idx_battle_entries_battle ON battle_entries(battle_id);
CREATE INDEX idx_battle_votes_battle ON battle_votes(battle_id);

ALTER TABLE art_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view battles" ON art_battles FOR SELECT USING (true);
CREATE POLICY "Users can create battles" ON art_battles FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Participants can update" ON art_battles FOR UPDATE USING (creator_id = auth.uid() OR opponent_id = auth.uid());

CREATE POLICY "Anyone can view entries" ON battle_entries FOR SELECT USING (true);
CREATE POLICY "Participants can submit" ON battle_entries FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view votes" ON battle_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON battle_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unvote" ON battle_votes FOR DELETE USING (user_id = auth.uid());

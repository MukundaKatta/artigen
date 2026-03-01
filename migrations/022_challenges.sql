-- Enhanced challenges system with streaks
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  prompt_hint text NOT NULL,
  cover_url text,
  challenge_type text DEFAULT 'daily' CHECK (challenge_type IN ('daily','weekly','monthly','event')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  entry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_challenges_active ON challenges(is_active, starts_at DESC);

CREATE TABLE IF NOT EXISTS creation_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_creation_date date,
  total_challenges_completed integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE creation_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges visible to all" ON challenges FOR SELECT USING (true);
CREATE POLICY "Users view own streak" ON creation_streaks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System manages streaks" ON creation_streaks FOR ALL USING (user_id = auth.uid());

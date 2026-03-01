-- Close Friends List
CREATE TABLE IF NOT EXISTS close_friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_close_friends_user ON close_friends(user_id);

-- Add audience column to stories and posts
ALTER TABLE stories ADD COLUMN IF NOT EXISTS audience text DEFAULT 'everyone' CHECK (audience IN ('everyone', 'close_friends'));
ALTER TABLE posts ADD COLUMN IF NOT EXISTS audience text DEFAULT 'everyone' CHECK (audience IN ('everyone', 'close_friends'));

-- RLS
ALTER TABLE close_friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own close friends" ON close_friends FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own close friends" ON close_friends FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own close friends" ON close_friends FOR DELETE USING (auth.uid() = user_id);

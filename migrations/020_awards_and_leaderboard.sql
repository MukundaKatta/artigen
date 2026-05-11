CREATE TABLE IF NOT EXISTS award_types (
  id text PRIMARY KEY,
  name text NOT NULL,
  emoji text NOT NULL,
  description text NOT NULL,
  tier text DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'diamond')),
  sort_order integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS post_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  award_type_id text REFERENCES award_types(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_awards_post ON post_awards(post_id);
CREATE INDEX IF NOT EXISTS idx_post_awards_user ON post_awards(user_id);

INSERT INTO award_types (id, name, emoji, description, tier, sort_order) VALUES
  ('fire', 'Fire', '🔥', 'This is fire!', 'bronze', 1),
  ('love', 'Love It', '❤️', 'Absolutely love this', 'bronze', 2),
  ('mindblown', 'Mind Blown', '🤯', 'This blew my mind', 'silver', 3),
  ('masterpiece', 'Masterpiece', '🎨', 'A true masterpiece', 'silver', 4),
  ('diamond', 'Diamond', '💎', 'Rare and precious art', 'gold', 5),
  ('trophy', 'Trophy', '🏆', 'Best of the best', 'diamond', 6)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE post_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE award_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view award types" ON award_types FOR SELECT USING (true);
CREATE POLICY "Anyone can view awards" ON post_awards FOR SELECT USING (true);
CREATE POLICY "Users can give awards" ON post_awards FOR INSERT WITH CHECK (user_id = auth.uid());

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS "Users can give awards" ON post_awards;
-- DROP POLICY IF EXISTS "Anyone can view awards" ON post_awards;
-- DROP POLICY IF EXISTS "Anyone can view award types" ON award_types;
-- DROP INDEX IF EXISTS idx_post_awards_user;
-- DROP INDEX IF EXISTS idx_post_awards_post;
-- DROP TABLE IF EXISTS post_awards;
-- DELETE FROM award_types WHERE id IN ('fire', 'love', 'mindblown', 'masterpiece', 'diamond', 'trophy');
-- DROP TABLE IF EXISTS award_types;

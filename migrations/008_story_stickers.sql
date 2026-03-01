-- Interactive Story Stickers
CREATE TABLE IF NOT EXISTS story_stickers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  sticker_type text NOT NULL CHECK (sticker_type IN ('poll','quiz','question','emoji_slider','countdown','link')),
  config jsonb NOT NULL DEFAULT '{}',
  position_x float DEFAULT 0.5,
  position_y float DEFAULT 0.5,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_story_stickers_story ON story_stickers(story_id);

CREATE TABLE IF NOT EXISTS story_sticker_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sticker_id uuid REFERENCES story_stickers(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  response jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(sticker_id, user_id)
);

CREATE INDEX idx_sticker_responses_sticker ON story_sticker_responses(sticker_id);

-- RLS
ALTER TABLE story_stickers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view story stickers" ON story_stickers FOR SELECT USING (true);
CREATE POLICY "Story owners can insert stickers" ON story_stickers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM stories WHERE id = story_id AND user_id = auth.uid())
);
CREATE POLICY "Story owners can delete stickers" ON story_stickers FOR DELETE USING (
  EXISTS (SELECT 1 FROM stories WHERE id = story_id AND user_id = auth.uid())
);

ALTER TABLE story_sticker_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view sticker responses" ON story_sticker_responses FOR SELECT USING (true);
CREATE POLICY "Users can insert own responses" ON story_sticker_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own responses" ON story_sticker_responses FOR UPDATE USING (auth.uid() = user_id);

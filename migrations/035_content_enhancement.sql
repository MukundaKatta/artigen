-- AI Music Generation
CREATE TABLE IF NOT EXISTS music_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  prompt text,
  mood text CHECK (mood IN ('calm','energetic','dramatic','mysterious','happy','sad','epic','ambient','playful','dark')),
  duration_seconds integer DEFAULT 30,
  genre text,
  result_audio_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Post music attachment
ALTER TABLE posts ADD COLUMN IF NOT EXISTS music_url text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS music_title text;

-- Custom Sticker Packs
CREATE TABLE IF NOT EXISTS sticker_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  cover_url text,
  is_public boolean DEFAULT true,
  download_count integer DEFAULT 0,
  sticker_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stickers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid REFERENCES sticker_packs(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  label text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_sticker_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pack_id uuid REFERENCES sticker_packs(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, pack_id)
);

-- Text-to-3D
CREATE TABLE IF NOT EXISTS text_to_3d_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  prompt text NOT NULL,
  negative_prompt text,
  model_id text DEFAULT 'meshy-ai/meshy',
  settings jsonb DEFAULT '{}',
  result_model_url text,
  result_thumbnail_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Indexes
CREATE INDEX idx_music_jobs_user ON music_generation_jobs(user_id);
CREATE INDEX idx_sticker_packs_creator ON sticker_packs(creator_id);
CREATE INDEX idx_sticker_packs_public ON sticker_packs(is_public) WHERE is_public;
CREATE INDEX idx_stickers_pack ON stickers(pack_id);
CREATE INDEX idx_user_sticker_packs_user ON user_sticker_packs(user_id);
CREATE INDEX idx_text_to_3d_jobs_user ON text_to_3d_jobs(user_id);

-- RLS
ALTER TABLE music_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sticker_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_to_3d_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own music jobs" ON music_generation_jobs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create music jobs" ON music_generation_jobs FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view public packs" ON sticker_packs FOR SELECT USING (is_public OR creator_id = auth.uid());
CREATE POLICY "Users create packs" ON sticker_packs FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creators update packs" ON sticker_packs FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Creators delete packs" ON sticker_packs FOR DELETE USING (creator_id = auth.uid());

CREATE POLICY "Anyone can view stickers" ON stickers FOR SELECT USING (true);
CREATE POLICY "Pack creators add stickers" ON stickers FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM sticker_packs WHERE id = pack_id AND creator_id = auth.uid()));
CREATE POLICY "Pack creators manage stickers" ON stickers FOR DELETE USING (EXISTS(SELECT 1 FROM sticker_packs WHERE id = pack_id AND creator_id = auth.uid()));

CREATE POLICY "Anyone can view saved packs" ON user_sticker_packs FOR SELECT USING (true);
CREATE POLICY "Users save packs" ON user_sticker_packs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users unsave packs" ON user_sticker_packs FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users view own 3d jobs" ON text_to_3d_jobs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create 3d jobs" ON text_to_3d_jobs FOR INSERT WITH CHECK (user_id = auth.uid());

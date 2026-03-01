-- Inpainting Jobs
CREATE TABLE IF NOT EXISTS inpainting_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  source_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  source_image_url text NOT NULL,
  mask_image_url text NOT NULL,
  prompt text NOT NULL,
  negative_prompt text,
  model_id text DEFAULT 'stability-ai/sdxl',
  settings jsonb DEFAULT '{}',
  result_image_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  result_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX idx_inpainting_jobs_user ON inpainting_jobs(user_id);
CREATE INDEX idx_inpainting_jobs_status ON inpainting_jobs(status);

-- Outpainting Jobs
CREATE TABLE IF NOT EXISTS outpainting_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  source_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  source_image_url text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('left','right','up','down','all')),
  expand_pixels integer DEFAULT 256,
  prompt text,
  model_id text DEFAULT 'stability-ai/sdxl',
  settings jsonb DEFAULT '{}',
  result_image_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  result_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX idx_outpainting_jobs_user ON outpainting_jobs(user_id);
CREATE INDEX idx_outpainting_jobs_status ON outpainting_jobs(status);

-- Upscaling Jobs
CREATE TABLE IF NOT EXISTS upscaling_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  source_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  source_image_url text NOT NULL,
  scale_factor integer DEFAULT 2 CHECK (scale_factor IN (2, 4)),
  model_id text DEFAULT 'nightmareai/real-esrgan',
  original_width integer,
  original_height integer,
  result_width integer,
  result_height integer,
  result_image_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  result_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX idx_upscaling_jobs_user ON upscaling_jobs(user_id);
CREATE INDEX idx_upscaling_jobs_status ON upscaling_jobs(status);

-- ControlNet Jobs
CREATE TABLE IF NOT EXISTS controlnet_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  source_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  control_image_url text NOT NULL,
  control_type text NOT NULL CHECK (control_type IN ('canny','depth','pose','scribble','normal','mlsd','seg')),
  prompt text NOT NULL,
  negative_prompt text,
  model_id text DEFAULT 'stability-ai/sdxl',
  control_strength real DEFAULT 1.0,
  settings jsonb DEFAULT '{}',
  result_image_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  result_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX idx_controlnet_jobs_user ON controlnet_jobs(user_id);
CREATE INDEX idx_controlnet_jobs_status ON controlnet_jobs(status);

-- ControlNet presets
CREATE TABLE IF NOT EXISTS controlnet_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  control_type text NOT NULL,
  preview_url text,
  default_strength real DEFAULT 1.0,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- RLS for all tables
ALTER TABLE inpainting_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE outpainting_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE upscaling_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE controlnet_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE controlnet_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own inpainting jobs" ON inpainting_jobs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create inpainting jobs" ON inpainting_jobs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own inpainting jobs" ON inpainting_jobs FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users view own outpainting jobs" ON outpainting_jobs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create outpainting jobs" ON outpainting_jobs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own outpainting jobs" ON outpainting_jobs FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users view own upscaling jobs" ON upscaling_jobs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create upscaling jobs" ON upscaling_jobs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own upscaling jobs" ON upscaling_jobs FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users view own controlnet jobs" ON controlnet_jobs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create controlnet jobs" ON controlnet_jobs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own controlnet jobs" ON controlnet_jobs FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "ControlNet presets visible to all" ON controlnet_presets FOR SELECT USING (is_active);

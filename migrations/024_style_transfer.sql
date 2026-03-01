CREATE TABLE IF NOT EXISTS style_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  preview_url text,
  prompt_modifier text NOT NULL,
  model_id text NOT NULL,
  settings jsonb DEFAULT '{}',
  category text DEFAULT 'artistic',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS restyle_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  source_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  source_image_url text NOT NULL,
  style_preset_id uuid REFERENCES style_presets(id) ON DELETE SET NULL,
  custom_style_prompt text,
  result_image_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  result_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_restyle_jobs_user ON restyle_jobs(user_id);
CREATE INDEX idx_restyle_jobs_status ON restyle_jobs(status);

ALTER TABLE style_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE restyle_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Style presets visible to all" ON style_presets FOR SELECT USING (is_active);
CREATE POLICY "Users view own restyle jobs" ON restyle_jobs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create restyle jobs" ON restyle_jobs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own restyle jobs" ON restyle_jobs FOR UPDATE USING (user_id = auth.uid());

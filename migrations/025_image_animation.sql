CREATE TABLE IF NOT EXISTS animation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  source_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  source_image_url text NOT NULL,
  animation_type text NOT NULL CHECK (animation_type IN ('motion','camera_pan','parallax','zoom','morph')),
  settings jsonb DEFAULT '{}',
  result_video_url text,
  thumbnail_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  result_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  error_message text,
  duration_seconds real DEFAULT 3.0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_animation_jobs_user ON animation_jobs(user_id);
CREATE INDEX idx_animation_jobs_status ON animation_jobs(status);

ALTER TABLE animation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own animation jobs" ON animation_jobs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create animation jobs" ON animation_jobs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own animation jobs" ON animation_jobs FOR UPDATE USING (user_id = auth.uid());

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS "Users update own animation jobs" ON animation_jobs;
-- DROP POLICY IF EXISTS "Users create animation jobs" ON animation_jobs;
-- DROP POLICY IF EXISTS "Users view own animation jobs" ON animation_jobs;
-- DROP INDEX IF EXISTS idx_animation_jobs_status;
-- DROP INDEX IF EXISTS idx_animation_jobs_user;
-- DROP TABLE IF EXISTS animation_jobs;

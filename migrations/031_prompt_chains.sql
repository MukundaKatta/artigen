CREATE TABLE IF NOT EXISTS workflow_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  steps jsonb NOT NULL DEFAULT '[]',
  is_public boolean DEFAULT false,
  use_count integer DEFAULT 0,
  save_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  template_id uuid REFERENCES workflow_templates(id) ON DELETE SET NULL,
  name text NOT NULL,
  steps jsonb NOT NULL DEFAULT '[]',
  current_step integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending','running','paused','completed','failed')),
  results jsonb DEFAULT '[]',
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS workflow_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  template_id uuid REFERENCES workflow_templates(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, template_id)
);

CREATE INDEX idx_workflow_templates_user ON workflow_templates(user_id);
CREATE INDEX idx_workflow_templates_public ON workflow_templates(is_public) WHERE is_public;
CREATE INDEX idx_workflow_runs_user ON workflow_runs(user_id);
CREATE INDEX idx_workflow_saves_user ON workflow_saves(user_id);

ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public templates viewable" ON workflow_templates FOR SELECT USING (is_public OR user_id = auth.uid());
CREATE POLICY "Users create templates" ON workflow_templates FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own templates" ON workflow_templates FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users delete own templates" ON workflow_templates FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users view own runs" ON workflow_runs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create runs" ON workflow_runs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own runs" ON workflow_runs FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Anyone view saves" ON workflow_saves FOR SELECT USING (true);
CREATE POLICY "Users save templates" ON workflow_saves FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users unsave" ON workflow_saves FOR DELETE USING (user_id = auth.uid());

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS "Users unsave" ON workflow_saves;
-- DROP POLICY IF EXISTS "Users save templates" ON workflow_saves;
-- DROP POLICY IF EXISTS "Anyone view saves" ON workflow_saves;
-- DROP POLICY IF EXISTS "Users update own runs" ON workflow_runs;
-- DROP POLICY IF EXISTS "Users create runs" ON workflow_runs;
-- DROP POLICY IF EXISTS "Users view own runs" ON workflow_runs;
-- DROP POLICY IF EXISTS "Users delete own templates" ON workflow_templates;
-- DROP POLICY IF EXISTS "Users update own templates" ON workflow_templates;
-- DROP POLICY IF EXISTS "Users create templates" ON workflow_templates;
-- DROP POLICY IF EXISTS "Public templates viewable" ON workflow_templates;
-- DROP INDEX IF EXISTS idx_workflow_saves_user;
-- DROP INDEX IF EXISTS idx_workflow_runs_user;
-- DROP INDEX IF EXISTS idx_workflow_templates_public;
-- DROP INDEX IF EXISTS idx_workflow_templates_user;
-- DROP TABLE IF EXISTS workflow_saves;
-- DROP TABLE IF EXISTS workflow_runs;
-- DROP TABLE IF EXISTS workflow_templates;

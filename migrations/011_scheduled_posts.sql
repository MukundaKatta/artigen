-- Scheduled Posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_draft boolean DEFAULT false;

-- DOWN
-- Manual rollback:
-- ALTER TABLE posts DROP COLUMN IF EXISTS is_draft;
-- ALTER TABLE posts DROP COLUMN IF EXISTS scheduled_at;

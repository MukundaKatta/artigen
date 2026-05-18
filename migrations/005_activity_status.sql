-- Activity Status (Online Indicator)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_activity_status boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();

-- DOWN
-- Manual rollback:
-- ALTER TABLE profiles DROP COLUMN IF EXISTS last_active_at;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS show_activity_status;

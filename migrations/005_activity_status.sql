-- Activity Status (Online Indicator)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_activity_status boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();

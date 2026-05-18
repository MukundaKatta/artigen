-- 037_future_foundation.sql
-- Phase 1 foundation for future-labs rollout.

-- Feature flags (server-side overrides)
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT false,
  rollout_percentage integer NOT NULL DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  platform text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);

-- Lightweight app telemetry sink (optional backend wiring for phase 2+)
CREATE TABLE IF NOT EXISTS app_telemetry_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  session_id text,
  event_name text NOT NULL,
  event_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  platform text,
  app_version text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_telemetry_events_name_created
  ON app_telemetry_events(event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_app_telemetry_events_user_created
  ON app_telemetry_events(user_id, created_at DESC);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_telemetry_events ENABLE ROW LEVEL SECURITY;

-- Read-only for authenticated clients; writes are intended for service-role/edge functions.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'feature_flags' AND policyname = 'Users can read feature flags'
  ) THEN
    CREATE POLICY "Users can read feature flags"
      ON feature_flags FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'app_telemetry_events' AND policyname = 'Users can read own telemetry events'
  ) THEN
    CREATE POLICY "Users can read own telemetry events"
      ON app_telemetry_events FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Seed future-labs flags (idempotent)
INSERT INTO feature_flags(key, enabled, rollout_percentage, metadata)
VALUES
  ('live_provenance', false, 0, '{"phase":"foundation"}'::jsonb),
  ('transparency_center', false, 0, '{"phase":"foundation"}'::jsonb),
  ('localization_studio', false, 0, '{"phase":"foundation"}'::jsonb),
  ('spatial_gallery', false, 0, '{"phase":"foundation"}'::jsonb),
  ('director_mode', false, 0, '{"phase":"foundation"}'::jsonb),
  ('commerce_v2', false, 0, '{"phase":"foundation"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- DOWN
-- Manual rollback:
-- DELETE FROM feature_flags WHERE key IN ('live_provenance', 'transparency_center', 'localization_studio', 'spatial_gallery', 'director_mode', 'commerce_v2');
-- DROP POLICY IF EXISTS "Users can read own telemetry events" ON app_telemetry_events;
-- DROP POLICY IF EXISTS "Users can read feature flags" ON feature_flags;
-- DROP INDEX IF EXISTS idx_app_telemetry_events_user_created;
-- DROP INDEX IF EXISTS idx_app_telemetry_events_name_created;
-- DROP INDEX IF EXISTS idx_feature_flags_enabled;
-- DROP TABLE IF EXISTS app_telemetry_events;
-- DROP TABLE IF EXISTS feature_flags;

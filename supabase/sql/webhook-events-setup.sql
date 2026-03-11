-- ============================================================
-- Webhook Events Table Setup (Idempotency for Stripe/Razorpay)
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create webhook_events table for idempotency tracking
CREATE TABLE IF NOT EXISTS webhook_events (
  id          text NOT NULL,
  provider    text NOT NULL CHECK (provider IN ('stripe', 'razorpay')),
  event_type  text,
  payload     jsonb,
  processed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, provider)
);

-- 2. Index for cleanup of old events
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed
  ON webhook_events (processed_at DESC);

-- 3. RLS: only service_role can access webhook events
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY webhook_events_service_only
  ON webhook_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4. Grant access to service_role only
GRANT SELECT, INSERT ON webhook_events TO service_role;

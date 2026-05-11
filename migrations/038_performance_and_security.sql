-- Migration 038: Performance indexes + webhook idempotency + audit logging
-- Addresses: missing indexes on hot query paths, webhook dedup, financial audit trail

-- ── Performance Indexes ─────────────────────────────────────────

-- Feed queries: user timeline sorted by date
CREATE INDEX IF NOT EXISTS idx_posts_user_created
  ON posts(user_id, created_at DESC);

-- Notification queries: unread notifications for a user
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read
  ON notifications(recipient_id, is_read, created_at DESC);

-- Comment threads: comments on a post sorted by date
CREATE INDEX IF NOT EXISTS idx_comments_post_created
  ON comments(post_id, created_at DESC);

-- Message threads: messages in a conversation sorted by date
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON messages(conversation_id, created_at DESC);

-- Wallet lookups by user
CREATE INDEX IF NOT EXISTS idx_wallets_user
  ON wallets(user_id);

-- Explore/trending: recent posts with engagement
CREATE INDEX IF NOT EXISTS idx_posts_created_likes
  ON posts(created_at DESC, likes_count DESC);

-- Follow lookups: who follows a user
CREATE INDEX IF NOT EXISTS idx_follows_following
  ON follows(following_id, created_at DESC);

-- ── Webhook Idempotency Table ───────────────────────────────────

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'stripe',
  payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-cleanup old webhook events (keep 90 days)
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed
  ON webhook_events(processed_at);

-- ── Audit Log Table ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user
  ON audit_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_action
  ON audit_log(action, created_at DESC);

-- RLS: users can only read their own audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_read ON audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- Webhook events: no direct user access (service role only)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS audit_log_read ON audit_log;
-- DROP INDEX IF EXISTS idx_audit_log_action;
-- DROP INDEX IF EXISTS idx_audit_log_user;
-- DROP TABLE IF EXISTS audit_log;
-- DROP INDEX IF EXISTS idx_webhook_events_processed;
-- DROP TABLE IF EXISTS webhook_events;
-- DROP INDEX IF EXISTS idx_follows_following;
-- DROP INDEX IF EXISTS idx_posts_created_likes;
-- DROP INDEX IF EXISTS idx_wallets_user;
-- DROP INDEX IF EXISTS idx_messages_conversation_created;
-- DROP INDEX IF EXISTS idx_comments_post_created;
-- DROP INDEX IF EXISTS idx_notifications_recipient_read;
-- DROP INDEX IF EXISTS idx_posts_user_created;

-- ============================================================
-- Notification RLS Policies
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Ensure RLS is enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications
CREATE POLICY IF NOT EXISTS notifications_select_own
  ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY IF NOT EXISTS notifications_update_own
  ON notifications FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Only service_role and triggers can insert notifications
-- (notifications are created by the system, not by users directly)
CREATE POLICY IF NOT EXISTS notifications_insert_system
  ON notifications FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Users can delete their own notifications
CREATE POLICY IF NOT EXISTS notifications_delete_own
  ON notifications FOR DELETE
  USING (recipient_id = auth.uid());

-- Fix content_labels: restrict creation to service_role only
-- (prevents users from labeling others' content arbitrarily)
DROP POLICY IF EXISTS "System creates labels" ON content_labels;
CREATE POLICY content_labels_service_insert
  ON content_labels FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

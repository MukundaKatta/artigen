-- Migration 043: Fix notification INSERT RLS policy
-- Problem: INSERT policy allows ANY authenticated user to create notifications,
-- enabling users to send fake notifications to other users.
-- Solution: Restrict INSERT to service_role only (edge functions + triggers).

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;
DROP POLICY IF EXISTS notifications_insert_system ON notifications;

-- Create restrictive policy: only service_role (edge functions, triggers) can insert
CREATE POLICY notifications_insert_service_only
  ON notifications FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS notifications_insert_service_only ON notifications;
-- CREATE POLICY "Authenticated users can create notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
-- CREATE POLICY notifications_insert_system ON notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

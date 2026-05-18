-- Migration 042: Fix engagement credits race condition
-- Problem: checkDuplicate (SELECT) and credit insert are separate operations,
-- allowing concurrent requests to both pass the check and double-insert.
-- Solution: Unique partial indexes for deduplication + atomic RPC function.

-- Unique index: prevent duplicate once-per-day actions (daily_login, first_post_of_day, etc.)
CREATE UNIQUE INDEX IF NOT EXISTS idx_engagement_credits_once_per_day
  ON engagement_credits (user_id, action, (created_at::date))
  WHERE action IN ('daily_login', 'first_post_of_day', 'streak_bonus_7_day', 'streak_bonus_30_day');

-- Unique index: prevent duplicate reference-based actions (vote, like, critique, refer)
CREATE UNIQUE INDEX IF NOT EXISTS idx_engagement_credits_reference_dedup
  ON engagement_credits (user_id, action, (metadata->>'reference_id'))
  WHERE metadata->>'reference_id' IS NOT NULL;

-- Atomic function: check caps + insert + credit wallet in a single transaction
CREATE OR REPLACE FUNCTION award_engagement_credits(
  p_user_id UUID,
  p_action TEXT,
  p_credits NUMERIC,
  p_metadata JSONB DEFAULT NULL,
  p_daily_cap NUMERIC DEFAULT 50,
  p_action_cap INTEGER DEFAULT NULL
)
RETURNS TABLE(credits_awarded NUMERIC, new_balance NUMERIC, error_code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today_start TIMESTAMPTZ;
  v_today_end TIMESTAMPTZ;
  v_earned_today NUMERIC;
  v_remaining NUMERIC;
  v_actual_credits NUMERIC;
  v_action_count INTEGER;
  v_new_balance NUMERIC;
BEGIN
  v_today_start := date_trunc('day', now());
  v_today_end := v_today_start + interval '1 day';

  -- Lock the user's engagement rows for today to serialize concurrent requests
  PERFORM 1 FROM engagement_credits
    WHERE user_id = p_user_id
      AND created_at >= v_today_start
      AND created_at < v_today_end
    FOR UPDATE;

  -- Check daily cap
  SELECT COALESCE(SUM(credits), 0) INTO v_earned_today
    FROM engagement_credits
    WHERE user_id = p_user_id
      AND created_at >= v_today_start
      AND created_at < v_today_end;

  v_remaining := p_daily_cap - v_earned_today;
  IF v_remaining <= 0 THEN
    RETURN QUERY SELECT 0::NUMERIC, 0::NUMERIC, 'daily_cap_reached'::TEXT;
    RETURN;
  END IF;

  -- Check per-action cap if specified
  IF p_action_cap IS NOT NULL THEN
    SELECT COUNT(*) INTO v_action_count
      FROM engagement_credits
      WHERE user_id = p_user_id
        AND action = p_action
        AND created_at >= v_today_start
        AND created_at < v_today_end;

    IF v_action_count >= p_action_cap THEN
      RETURN QUERY SELECT 0::NUMERIC, 0::NUMERIC, 'action_daily_limit'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Clamp credits to remaining cap
  v_actual_credits := LEAST(p_credits, v_remaining);

  -- Insert the engagement credit (unique indexes will catch true duplicates)
  BEGIN
    INSERT INTO engagement_credits (user_id, action, credits, metadata)
    VALUES (p_user_id, p_action, v_actual_credits, p_metadata);
  EXCEPTION WHEN unique_violation THEN
    RETURN QUERY SELECT 0::NUMERIC, 0::NUMERIC, 'already_claimed'::TEXT;
    RETURN;
  END;

  -- Add credits to wallet atomically
  UPDATE wallets SET balance_cents = balance_cents + v_actual_credits
    WHERE user_id = p_user_id;

  SELECT balance_cents INTO v_new_balance FROM wallets WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_actual_credits, COALESCE(v_new_balance, 0::NUMERIC), NULL::TEXT;
END;
$$;

-- DOWN
-- Manual rollback:
-- DROP FUNCTION IF EXISTS award_engagement_credits(UUID, TEXT, NUMERIC, JSONB, NUMERIC, INTEGER);
-- DROP INDEX IF EXISTS idx_engagement_credits_reference_dedup;
-- DROP INDEX IF EXISTS idx_engagement_credits_once_per_day;

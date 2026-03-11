-- ============================================================
-- Atomic Wallet Debit RPC (for Tips, Marketplace, etc.)
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Generic wallet debit function with row-level locking
--    Used by process-tip and other wallet operations.
--    Throws 'insufficient_credits' if balance too low.
CREATE OR REPLACE FUNCTION debit_wallet(p_user_id uuid, p_amount int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id uuid;
  v_balance   int;
BEGIN
  -- Lock the wallet row to prevent race conditions
  SELECT id, balance_cents INTO v_wallet_id, v_balance
  FROM wallets WHERE user_id = p_user_id FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'wallet_not_found';
  END IF;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;

  UPDATE wallets
  SET balance_cents = balance_cents - p_amount,
      lifetime_spent_cents = lifetime_spent_cents + p_amount,
      updated_at = now()
  WHERE id = v_wallet_id;
END;
$$;

-- 2. Atomic tip processing function
--    Handles sender debit, recipient credit, fee calculation,
--    and transaction logging in a single transaction.
CREATE OR REPLACE FUNCTION process_tip_atomic(
  p_sender_id    uuid,
  p_recipient_id uuid,
  p_amount       int,
  p_fee          int,
  p_post_id      uuid DEFAULT NULL,
  p_message      text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sender_wallet_id   uuid;
  v_recipient_wallet_id uuid;
  v_sender_balance     int;
  v_tip_id             uuid;
BEGIN
  -- Lock sender wallet
  SELECT id, balance_cents INTO v_sender_wallet_id, v_sender_balance
  FROM wallets WHERE user_id = p_sender_id FOR UPDATE;

  IF v_sender_wallet_id IS NULL THEN
    RAISE EXCEPTION 'sender_wallet_not_found';
  END IF;

  IF v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;

  -- Debit sender
  UPDATE wallets
  SET balance_cents = balance_cents - p_amount,
      lifetime_spent_cents = lifetime_spent_cents + p_amount,
      updated_at = now()
  WHERE id = v_sender_wallet_id;

  -- Credit recipient (upsert wallet if missing)
  INSERT INTO wallets (user_id, balance_cents, currency)
  VALUES (p_recipient_id, 0, 'usd')
  ON CONFLICT (user_id) DO NOTHING;

  SELECT id INTO v_recipient_wallet_id
  FROM wallets WHERE user_id = p_recipient_id FOR UPDATE;

  UPDATE wallets
  SET balance_cents = balance_cents + (p_amount - p_fee),
      lifetime_earned_cents = lifetime_earned_cents + (p_amount - p_fee),
      updated_at = now()
  WHERE id = v_recipient_wallet_id;

  -- Create tip record
  INSERT INTO tips (sender_id, recipient_id, amount_cents, fee_cents, post_id, message, status)
  VALUES (p_sender_id, p_recipient_id, p_amount, p_fee, p_post_id, p_message, 'completed')
  RETURNING id INTO v_tip_id;

  -- Log sender transaction
  INSERT INTO wallet_transactions (wallet_id, type, amount_cents, fee_cents, description, status)
  VALUES (v_sender_wallet_id, 'tip_sent', p_amount, 0, 'Tip sent', 'completed');

  -- Log recipient transaction
  INSERT INTO wallet_transactions (wallet_id, type, amount_cents, fee_cents, description, status)
  VALUES (v_recipient_wallet_id, 'tip_received', p_amount - p_fee, p_fee, 'Tip received', 'completed');

  RETURN v_tip_id;
END;
$$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION debit_wallet(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION process_tip_atomic(uuid, uuid, int, int, uuid, text) TO authenticated;

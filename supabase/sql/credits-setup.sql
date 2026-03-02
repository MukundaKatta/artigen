-- ============================================================
-- AI Credits Setup
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Atomic credit deduction RPC
--    Throws 'insufficient_credits' if balance too low
CREATE OR REPLACE FUNCTION deduct_generation_credits(p_user_id uuid, p_cost int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id uuid;
  v_balance   int;
BEGIN
  -- Lock the wallet row
  SELECT id, balance_cents INTO v_wallet_id, v_balance
  FROM wallets WHERE user_id = p_user_id FOR UPDATE;

  -- Auto-create wallet if missing
  IF v_wallet_id IS NULL THEN
    INSERT INTO wallets (user_id, balance_cents, currency)
    VALUES (p_user_id, 0, 'usd')
    RETURNING id INTO v_wallet_id;
    v_balance := 0;
  END IF;

  IF v_balance < p_cost THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;

  UPDATE wallets
  SET balance_cents = balance_cents - p_cost,
      lifetime_spent_cents = lifetime_spent_cents + p_cost,
      updated_at = now()
  WHERE id = v_wallet_id;
END;
$$;

-- 2. Refund credits RPC (called on generation failure)
CREATE OR REPLACE FUNCTION refund_generation_credits(p_user_id uuid, p_cost int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE wallets
  SET balance_cents = balance_cents + p_cost,
      lifetime_spent_cents = GREATEST(0, lifetime_spent_cents - p_cost),
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- 3. Add credits RPC (called by payment webhooks)
CREATE OR REPLACE FUNCTION add_credits(p_user_id uuid, p_amount int, p_description text DEFAULT 'Credit purchase')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id uuid;
BEGIN
  -- Upsert wallet
  INSERT INTO wallets (user_id, balance_cents, currency)
  VALUES (p_user_id, 0, 'usd')
  ON CONFLICT (user_id) DO NOTHING;

  SELECT id INTO v_wallet_id FROM wallets WHERE user_id = p_user_id;

  UPDATE wallets
  SET balance_cents = balance_cents + p_amount,
      lifetime_earned_cents = lifetime_earned_cents + p_amount,
      updated_at = now()
  WHERE id = v_wallet_id;

  -- Log transaction
  INSERT INTO wallet_transactions (wallet_id, type, amount_cents, fee_cents, description, status)
  VALUES (v_wallet_id, 'deposit', p_amount, 0, p_description, 'completed');
END;
$$;

-- 4. Grant 100 free starter credits to new users
--    Add to the handle_new_user trigger (or create a new one)
CREATE OR REPLACE FUNCTION grant_starter_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM add_credits(NEW.id, 100, 'Welcome gift — 100 starter credits');
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table (fires after first profile insert)
DROP TRIGGER IF EXISTS on_profile_created_grant_credits ON profiles;
CREATE TRIGGER on_profile_created_grant_credits
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION grant_starter_credits();

-- 5. Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION deduct_generation_credits(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION refund_generation_credits(uuid, int)  TO authenticated;
GRANT EXECUTE ON FUNCTION add_credits(uuid, int, text)          TO service_role;

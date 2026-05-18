-- Migration 041: Wallet safety constraints
-- Prevents negative balances and adds input validation

-- Add CHECK constraint to prevent negative wallet balance
ALTER TABLE wallets
  ADD CONSTRAINT wallets_balance_non_negative CHECK (balance_cents >= 0);

-- Add CHECK constraint on tip amounts
ALTER TABLE tips
  ADD CONSTRAINT tips_amount_positive CHECK (amount_cents > 0 AND amount_cents <= 100000);

-- Add partial index for active (non-draft, non-archived) posts
CREATE INDEX IF NOT EXISTS idx_posts_active_feed
  ON posts (created_at DESC)
  WHERE is_draft = false AND is_archived = false;

-- Add index for prompt library trending queries
CREATE INDEX IF NOT EXISTS idx_prompt_library_trending
  ON prompt_library (save_count DESC)
  WHERE is_public = true;

-- Improve the deduct_generation_credits function to be truly atomic
CREATE OR REPLACE FUNCTION deduct_generation_credits(p_user_id UUID, p_cost INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE wallets
  SET balance_cents = balance_cents - p_cost,
      updated_at = now()
  WHERE user_id = p_user_id
    AND balance_cents >= p_cost;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Improve the refund function
CREATE OR REPLACE FUNCTION refund_generation_credits(p_user_id UUID, p_cost INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE wallets
  SET balance_cents = balance_cents + p_cost,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- DOWN
-- Manual rollback:
-- DROP FUNCTION IF EXISTS refund_generation_credits(UUID, INTEGER);
-- DROP FUNCTION IF EXISTS deduct_generation_credits(UUID, INTEGER);
-- DROP INDEX IF EXISTS idx_prompt_library_trending;
-- DROP INDEX IF EXISTS idx_posts_active_feed;
-- ALTER TABLE tips DROP CONSTRAINT IF EXISTS tips_amount_positive;
-- ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_balance_non_negative;

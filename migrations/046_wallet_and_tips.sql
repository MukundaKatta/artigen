CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance_cents integer DEFAULT 0,
  lifetime_earned_cents integer DEFAULT 0,
  lifetime_spent_cents integer DEFAULT 0,
  currency text DEFAULT 'usd',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES wallets(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit','withdrawal','tip_sent','tip_received','purchase','sale','subscription_payment','subscription_earning')),
  amount_cents integer NOT NULL,
  fee_cents integer DEFAULT 0,
  counterparty_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  description text DEFAULT '',
  status text DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','refunded')),
  external_ref text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_created ON wallet_transactions(created_at DESC);

CREATE TABLE IF NOT EXISTS tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  message text DEFAULT '',
  transaction_id uuid REFERENCES wallet_transactions(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_tips_recipient ON tips(recipient_id);
CREATE INDEX idx_tips_post ON tips(post_id);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallet" ON wallets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System creates wallets" ON wallets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users view own transactions" ON wallet_transactions FOR SELECT
  USING (wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid()));
CREATE POLICY "Users view tips they sent or received" ON tips FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Users can send tips" ON tips FOR INSERT WITH CHECK (sender_id = auth.uid());

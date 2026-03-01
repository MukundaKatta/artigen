-- Creator Subscription Tiers
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price_cents integer NOT NULL,
  currency text DEFAULT 'usd',
  benefits jsonb DEFAULT '[]',
  badge_label text,
  badge_color text DEFAULT '#FFD700',
  is_active boolean DEFAULT true,
  max_subscribers integer,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_subscription_tiers_creator ON subscription_tiers(creator_id);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tier_id uuid REFERENCES subscription_tiers(id) ON DELETE SET NULL,
  status text DEFAULT 'active' CHECK (status IN ('active','cancelled','expired','paused')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(subscriber_id, creator_id)
);

CREATE INDEX idx_subscriptions_creator ON subscriptions(creator_id);
CREATE INDEX idx_subscriptions_subscriber ON subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status) WHERE status = 'active';

ALTER TABLE posts ADD COLUMN IF NOT EXISTS subscription_tier_id uuid REFERENCES subscription_tiers(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscriber_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_creator boolean DEFAULT false;

ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tiers" ON subscription_tiers FOR SELECT USING (is_active OR creator_id = auth.uid());
CREATE POLICY "Creators manage own tiers" ON subscription_tiers FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creators update own tiers" ON subscription_tiers FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Creators delete own tiers" ON subscription_tiers FOR DELETE USING (creator_id = auth.uid());

CREATE POLICY "Users view own subscriptions or creators see their subscribers" ON subscriptions
  FOR SELECT USING (subscriber_id = auth.uid() OR creator_id = auth.uid());
CREATE POLICY "Users can subscribe" ON subscriptions FOR INSERT WITH CHECK (subscriber_id = auth.uid());
CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE USING (subscriber_id = auth.uid());

CREATE OR REPLACE FUNCTION update_subscriber_count() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE profiles SET subscriber_count = subscriber_count + 1 WHERE id = NEW.creator_id;
  ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status != 'active') THEN
    UPDATE profiles SET subscriber_count = GREATEST(0, subscriber_count - 1) WHERE id = COALESCE(OLD.creator_id, NEW.creator_id);
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'active' AND NEW.status = 'active' THEN
    UPDATE profiles SET subscriber_count = subscriber_count + 1 WHERE id = NEW.creator_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_subscriber_count
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_subscriber_count();

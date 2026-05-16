CREATE TABLE IF NOT EXISTS marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  listing_type text NOT NULL CHECK (listing_type IN ('digital_download','print_on_demand')),
  title text NOT NULL,
  description text DEFAULT '',
  price_cents integer NOT NULL CHECK (price_cents > 0),
  currency text DEFAULT 'usd',
  digital_file_url text,
  digital_file_size_bytes bigint,
  print_options jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  sales_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_marketplace_post ON marketplace_listings(post_id);
CREATE INDEX idx_marketplace_seller ON marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_active ON marketplace_listings(is_active) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  seller_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  listing_id uuid REFERENCES marketplace_listings(id) ON DELETE SET NULL NOT NULL,
  order_type text NOT NULL CHECK (order_type IN ('digital_download','print_on_demand')),
  status text DEFAULT 'pending' CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  amount_cents integer NOT NULL,
  fee_cents integer DEFAULT 0,
  print_config jsonb,
  shipping_address jsonb,
  tracking_number text,
  download_url text,
  download_expires_at timestamptz,
  transaction_id uuid REFERENCES wallet_transactions(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);

ALTER TABLE posts ADD COLUMN IF NOT EXISTS has_listing boolean DEFAULT false;

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active listings visible to all" ON marketplace_listings FOR SELECT USING (is_active OR seller_id = auth.uid());
CREATE POLICY "Sellers create listings" ON marketplace_listings FOR INSERT WITH CHECK (seller_id = auth.uid());
CREATE POLICY "Sellers manage listings" ON marketplace_listings FOR UPDATE USING (seller_id = auth.uid());
CREATE POLICY "Sellers delete listings" ON marketplace_listings FOR DELETE USING (seller_id = auth.uid());

CREATE POLICY "Buyers and sellers view orders" ON orders FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "Buyers create orders" ON orders FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Order parties can update" ON orders FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS "Order parties can update" ON orders;
-- DROP POLICY IF EXISTS "Buyers create orders" ON orders;
-- DROP POLICY IF EXISTS "Buyers and sellers view orders" ON orders;
-- DROP POLICY IF EXISTS "Sellers delete listings" ON marketplace_listings;
-- DROP POLICY IF EXISTS "Sellers manage listings" ON marketplace_listings;
-- DROP POLICY IF EXISTS "Sellers create listings" ON marketplace_listings;
-- DROP POLICY IF EXISTS "Active listings visible to all" ON marketplace_listings;
-- ALTER TABLE posts DROP COLUMN IF EXISTS has_listing;
-- DROP INDEX IF EXISTS idx_orders_status;
-- DROP INDEX IF EXISTS idx_orders_seller;
-- DROP INDEX IF EXISTS idx_orders_buyer;
-- DROP INDEX IF EXISTS idx_marketplace_active;
-- DROP INDEX IF EXISTS idx_marketplace_seller;
-- DROP INDEX IF EXISTS idx_marketplace_post;
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS marketplace_listings;

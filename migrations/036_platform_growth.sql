-- Portfolio Mode
CREATE TABLE IF NOT EXISTS portfolio_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES portfolio_sections(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  caption_override text,
  sort_order integer DEFAULT 0,
  UNIQUE(section_id, post_id)
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_enabled boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_contact_email text;

-- Cross-Posting
CREATE TABLE IF NOT EXISTS cross_post_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL CHECK (platform IN ('photo','twitter','tiktok','facebook','pinterest','threads')),
  platform_username text,
  is_connected boolean DEFAULT false,
  access_token_encrypted text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

CREATE TABLE IF NOT EXISTS cross_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  platform_post_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','posting','posted','failed')),
  error_message text,
  posted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- AR Preview
CREATE TABLE IF NOT EXISTS ar_previews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  frame_style text DEFAULT 'none' CHECK (frame_style IN ('none','thin_black','thin_white','gallery','modern','ornate')),
  default_width_cm integer DEFAULT 60,
  default_height_cm integer DEFAULT 40,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_portfolio_sections_user ON portfolio_sections(user_id);
CREATE INDEX idx_portfolio_items_section ON portfolio_items(section_id);
CREATE INDEX idx_cross_post_accounts_user ON cross_post_accounts(user_id);
CREATE INDEX idx_cross_posts_post ON cross_posts(post_id);
CREATE INDEX idx_cross_posts_user ON cross_posts(user_id);
CREATE INDEX idx_ar_previews_post ON ar_previews(post_id);

-- RLS
ALTER TABLE portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_post_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_previews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view portfolio sections" ON portfolio_sections FOR SELECT USING (true);
CREATE POLICY "Users manage own sections" ON portfolio_sections FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own sections" ON portfolio_sections FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users delete own sections" ON portfolio_sections FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Anyone can view portfolio items" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "Section owners manage items" ON portfolio_items FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM portfolio_sections WHERE id = section_id AND user_id = auth.uid()));
CREATE POLICY "Section owners update items" ON portfolio_items FOR UPDATE USING (EXISTS(SELECT 1 FROM portfolio_sections WHERE id = section_id AND user_id = auth.uid()));
CREATE POLICY "Section owners delete items" ON portfolio_items FOR DELETE USING (EXISTS(SELECT 1 FROM portfolio_sections WHERE id = section_id AND user_id = auth.uid()));

CREATE POLICY "Users view own accounts" ON cross_post_accounts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users manage accounts" ON cross_post_accounts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update accounts" ON cross_post_accounts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users delete accounts" ON cross_post_accounts FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users view own cross posts" ON cross_posts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create cross posts" ON cross_posts FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view ar previews" ON ar_previews FOR SELECT USING (true);
CREATE POLICY "Post owners create ar preview" ON ar_previews FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM posts WHERE id = post_id AND user_id = auth.uid()));
CREATE POLICY "Post owners update ar preview" ON ar_previews FOR UPDATE USING (EXISTS(SELECT 1 FROM posts WHERE id = post_id AND user_id = auth.uid()));

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS "Post owners update ar preview" ON ar_previews;
-- DROP POLICY IF EXISTS "Post owners create ar preview" ON ar_previews;
-- DROP POLICY IF EXISTS "Anyone can view ar previews" ON ar_previews;
-- DROP POLICY IF EXISTS "Users create cross posts" ON cross_posts;
-- DROP POLICY IF EXISTS "Users view own cross posts" ON cross_posts;
-- DROP POLICY IF EXISTS "Users delete accounts" ON cross_post_accounts;
-- DROP POLICY IF EXISTS "Users update accounts" ON cross_post_accounts;
-- DROP POLICY IF EXISTS "Users manage accounts" ON cross_post_accounts;
-- DROP POLICY IF EXISTS "Users view own accounts" ON cross_post_accounts;
-- DROP POLICY IF EXISTS "Section owners delete items" ON portfolio_items;
-- DROP POLICY IF EXISTS "Section owners update items" ON portfolio_items;
-- DROP POLICY IF EXISTS "Section owners manage items" ON portfolio_items;
-- DROP POLICY IF EXISTS "Anyone can view portfolio items" ON portfolio_items;
-- DROP POLICY IF EXISTS "Users delete own sections" ON portfolio_sections;
-- DROP POLICY IF EXISTS "Users update own sections" ON portfolio_sections;
-- DROP POLICY IF EXISTS "Users manage own sections" ON portfolio_sections;
-- DROP POLICY IF EXISTS "Anyone can view portfolio sections" ON portfolio_sections;
-- DROP INDEX IF EXISTS idx_ar_previews_post;
-- DROP INDEX IF EXISTS idx_cross_posts_user;
-- DROP INDEX IF EXISTS idx_cross_posts_post;
-- DROP INDEX IF EXISTS idx_cross_post_accounts_user;
-- DROP INDEX IF EXISTS idx_portfolio_items_section;
-- DROP INDEX IF EXISTS idx_portfolio_sections_user;
-- DROP TABLE IF EXISTS ar_previews;
-- DROP TABLE IF EXISTS cross_posts;
-- DROP TABLE IF EXISTS cross_post_accounts;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS portfolio_contact_email;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS portfolio_bio;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS portfolio_enabled;
-- DROP TABLE IF EXISTS portfolio_items;
-- DROP TABLE IF EXISTS portfolio_sections;

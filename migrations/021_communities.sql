-- Enhanced communities (extend existing communities table)
ALTER TABLE communities ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS post_count integer DEFAULT 0;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS custom_reactions text[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_communities_slug ON communities(slug);

CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  posted_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(community_id, post_id)
);

CREATE INDEX idx_community_posts_community ON community_posts(community_id);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community posts visible to members" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Members can post" ON community_posts FOR INSERT WITH CHECK (
  posted_by = auth.uid() AND
  community_id IN (SELECT community_id FROM community_members WHERE user_id = auth.uid())
);

CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  avatar_url text,
  cover_url text,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  member_count integer DEFAULT 1,
  is_private boolean DEFAULT false,
  rules text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(community_id, user_id)
);

ALTER TABLE posts ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES communities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_communities_tags ON communities USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id) WHERE community_id IS NOT NULL;

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public communities visible to all" ON communities FOR SELECT USING (NOT is_private OR EXISTS(SELECT 1 FROM community_members WHERE community_id = id AND user_id = auth.uid()));
CREATE POLICY "Users can create communities" ON communities FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can update" ON communities FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owner can delete" ON communities FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY "Members visible" ON community_members FOR SELECT USING (true);
CREATE POLICY "Users can join" ON community_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can leave" ON community_members FOR DELETE USING (user_id = auth.uid() OR EXISTS(SELECT 1 FROM communities WHERE id = community_id AND owner_id = auth.uid()));

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS "Users can leave" ON community_members;
-- DROP POLICY IF EXISTS "Users can join" ON community_members;
-- DROP POLICY IF EXISTS "Members visible" ON community_members;
-- DROP POLICY IF EXISTS "Owner can delete" ON communities;
-- DROP POLICY IF EXISTS "Owner can update" ON communities;
-- DROP POLICY IF EXISTS "Users can create communities" ON communities;
-- DROP POLICY IF EXISTS "Public communities visible to all" ON communities;
-- DROP INDEX IF EXISTS idx_posts_community;
-- DROP INDEX IF EXISTS idx_community_members_user;
-- DROP INDEX IF EXISTS idx_community_members_community;
-- DROP INDEX IF EXISTS idx_communities_tags;
-- ALTER TABLE posts DROP COLUMN IF EXISTS community_id;
-- DROP TABLE IF EXISTS community_members;
-- DROP TABLE IF EXISTS communities;

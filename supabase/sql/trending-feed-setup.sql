-- Trending Feed Setup
-- Creates a database function to retrieve trending posts scored by engagement,
-- with filtering for blocked users and reported posts.

-- ── Function: get_trending_posts ──────────────────────────────────

CREATE OR REPLACE FUNCTION get_trending_posts(
  p_limit  INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_viewer_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id              UUID,
  user_id         UUID,
  caption         TEXT,
  post_type       TEXT,
  location        TEXT,
  audience        TEXT,
  is_pinned       BOOLEAN,
  is_archived     BOOLEAN,
  is_draft        BOOLEAN,
  likes_count     INT,
  comments_count  INT,
  views_count     INT,
  created_at      TIMESTAMPTZ,
  -- user profile fields
  username        TEXT,
  full_name       TEXT,
  avatar_url      TEXT,
  is_verified     BOOLEAN,
  -- engagement score
  trending_score  DOUBLE PRECISION,
  -- viewer-specific flags
  is_liked        BOOLEAN,
  is_saved        BOOLEAN
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.caption,
    p.post_type::TEXT,
    p.location,
    p.audience::TEXT,
    p.is_pinned,
    p.is_archived,
    p.is_draft,
    p.likes_count,
    p.comments_count,
    p.views_count,
    p.created_at,
    -- user profile
    pr.username,
    pr.full_name,
    pr.avatar_url,
    pr.is_verified,
    -- Scoring: (likes*3 + comments*5 + saves*2 + remixes*8) / (hours_age + 2)^1.5
    (
      (p.likes_count * 3
       + p.comments_count * 5
       + COALESCE(saves_agg.save_count, 0) * 2
       + COALESCE(remix_agg.remix_count, 0) * 8
      )::DOUBLE PRECISION
      / POWER(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600.0 + 2, 1.5)
    ) AS trending_score,
    -- viewer flags
    CASE WHEN p_viewer_id IS NOT NULL
      THEN EXISTS (
        SELECT 1 FROM likes l
        WHERE l.post_id = p.id AND l.user_id = p_viewer_id
      )
      ELSE FALSE
    END AS is_liked,
    CASE WHEN p_viewer_id IS NOT NULL
      THEN EXISTS (
        SELECT 1 FROM saved_posts sp
        WHERE sp.post_id = p.id AND sp.user_id = p_viewer_id
      )
      ELSE FALSE
    END AS is_saved
  FROM posts p
  JOIN profiles pr ON pr.id = p.user_id
  -- Count saves per post
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::INT AS save_count
    FROM saved_posts sp
    WHERE sp.post_id = p.id
  ) saves_agg ON TRUE
  -- Count remixes per post
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::INT AS remix_count
    FROM posts remix
    WHERE remix.remix_of_post_id = p.id
  ) remix_agg ON TRUE
  WHERE
    p.is_archived = FALSE
    AND p.is_draft = FALSE
    AND p.scheduled_at IS NULL
    AND p.audience = 'everyone'
    -- Exclude blocked users (both directions)
    AND (p_viewer_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM user_blocks ub
      WHERE (ub.blocker_id = p_viewer_id AND ub.blocked_id = p.user_id)
         OR (ub.blocker_id = p.user_id AND ub.blocked_id = p_viewer_id)
    ))
    -- Exclude reported posts
    AND NOT EXISTS (
      SELECT 1 FROM reports r
      WHERE r.reported_post_id = p.id
        AND r.status IN ('pending', 'confirmed')
    )
  ORDER BY trending_score DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ── Indexes to support the trending query ─────────────────────────

-- Partial index for public, non-archived, non-draft posts (the main filter)
CREATE INDEX IF NOT EXISTS idx_posts_trending_filter
  ON posts (created_at DESC)
  WHERE is_archived = FALSE
    AND is_draft = FALSE
    AND scheduled_at IS NULL
    AND audience = 'everyone';

-- Index on saved_posts.post_id for fast save counting
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id
  ON saved_posts (post_id);

-- Index on posts.remix_of_post_id for fast remix counting
CREATE INDEX IF NOT EXISTS idx_posts_remix_of_post_id
  ON posts (remix_of_post_id)
  WHERE remix_of_post_id IS NOT NULL;

-- Index on reports.reported_post_id for exclusion filter
CREATE INDEX IF NOT EXISTS idx_reports_reported_post_id
  ON reports (reported_post_id)
  WHERE reported_post_id IS NOT NULL
    AND status IN ('pending', 'confirmed');

-- Index on user_blocks for both directions
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker
  ON user_blocks (blocker_id, blocked_id);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked
  ON user_blocks (blocked_id, blocker_id);

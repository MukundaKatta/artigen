-- ============================================================
-- Missing Database Indexes for Performance
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Posts: user profile feed
CREATE INDEX IF NOT EXISTS idx_posts_user_date
  ON posts (user_id, created_at DESC);

-- Posts: public feed (exclude drafts/archived)
CREATE INDEX IF NOT EXISTS idx_posts_feed
  ON posts (created_at DESC)
  WHERE is_draft = false AND is_archived = false;

-- Comments: fetch comments for a post
CREATE INDEX IF NOT EXISTS idx_comments_post_date
  ON comments (post_id, created_at ASC);

-- Comments: fetch replies for a comment
CREATE INDEX IF NOT EXISTS idx_comments_parent_date
  ON comments (parent_comment_id, created_at ASC)
  WHERE parent_comment_id IS NOT NULL;

-- Likes: check if user liked a post (unique constraint also acts as index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_user_post
  ON likes (user_id, post_id);

-- Likes: count likes per post
CREATE INDEX IF NOT EXISTS idx_likes_post
  ON likes (post_id);

-- Post reactions: check existing reaction
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_user
  ON post_reactions (post_id, user_id);

-- Saved posts: browse user's saved posts
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_date
  ON saved_posts (user_id, created_at DESC);

-- Notifications: fetch unread notifications efficiently
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
  ON notifications (recipient_id, is_read, created_at DESC);

-- Post media: fetch in order
CREATE INDEX IF NOT EXISTS idx_post_media_post_order
  ON post_media (post_id, sort_order);

-- Follows: check follow status
CREATE INDEX IF NOT EXISTS idx_follows_pair
  ON follows (follower_id, following_id);

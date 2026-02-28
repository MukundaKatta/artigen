-- Migration 001: Comment likes count + trigger, Pinned posts columns
-- Run this in your Supabase SQL Editor

-- 1. Add likes_count to comments for comment likes feature
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;

-- 2. Trigger to auto-update comment likes_count
CREATE OR REPLACE FUNCTION public.handle_comment_like_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments SET likes_count = likes_count + 1 WHERE id = new.comment_id;
    RETURN new;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments SET likes_count = greatest(0, likes_count - 1) WHERE id = old.comment_id;
    RETURN old;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_like_change
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_like_count();

-- 3. Pinned posts columns
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS pinned_at timestamptz;

-- 4. Follow request status
ALTER TABLE public.follows ADD COLUMN IF NOT EXISTS status text DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted'));

-- 5. Theme preference
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'system';

-- 6. Message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(message_id, user_id, emoji)
);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view reactions" ON public.message_reactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
    WHERE m.id = message_reactions.message_id AND cp.user_id = auth.uid()
  ));

CREATE POLICY "Users can add reactions" ON public.message_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions" ON public.message_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- 7. User blocks table
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  blocker_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own blocks" ON public.user_blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users can block" ON public.user_blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can unblock" ON public.user_blocks FOR DELETE USING (auth.uid() = blocker_id);

-- 8. Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reported_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can see own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

-- 9. Story highlights tables
CREATE TABLE IF NOT EXISTS public.story_highlights (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  cover_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.story_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Highlights are viewable by everyone" ON public.story_highlights FOR SELECT USING (true);
CREATE POLICY "Users can manage own highlights" ON public.story_highlights FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.story_highlight_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  highlight_id uuid REFERENCES public.story_highlights(id) ON DELETE CASCADE NOT NULL,
  story_id uuid REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  sort_order integer DEFAULT 0,
  UNIQUE(highlight_id, story_id)
);

ALTER TABLE public.story_highlight_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Highlight items are viewable" ON public.story_highlight_items FOR SELECT USING (true);
CREATE POLICY "Highlight owners can manage items" ON public.story_highlight_items FOR ALL
  USING (EXISTS (SELECT 1 FROM story_highlights WHERE id = highlight_id AND user_id = auth.uid()));

-- 10. Suggested users function (friends-of-friends)
CREATE OR REPLACE FUNCTION get_suggested_users(current_user_id uuid, result_limit int DEFAULT 10)
RETURNS TABLE (id uuid, username text, full_name text, avatar_url text, is_verified boolean, mutual_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.full_name, p.avatar_url, p.is_verified,
         COUNT(DISTINCT f2.follower_id) as mutual_count
  FROM follows f1
  JOIN follows f2 ON f2.follower_id = f1.following_id
  JOIN profiles p ON p.id = f2.following_id
  WHERE f1.follower_id = current_user_id
    AND f1.status = 'accepted'
    AND f2.status = 'accepted'
    AND f2.following_id != current_user_id
    AND NOT EXISTS (
      SELECT 1 FROM follows WHERE follower_id = current_user_id AND following_id = f2.following_id
    )
  GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.is_verified
  ORDER BY mutual_count DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

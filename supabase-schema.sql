-- ============================================================
-- Artigen Database Schema
-- Run this in your Supabase SQL Editor (supabase.com > SQL Editor)
-- ============================================================

-- EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- for fuzzy text search

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text not null default '',
  avatar_url text,
  bio text default '',
  website text default '',
  is_private boolean default false,
  is_verified boolean default false,
  followers_count integer default 0,
  following_count integer default 0,
  posts_count integer default 0,
  push_token text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_profiles_username_trgm on public.profiles
  using gin (username gin_trgm_ops);

-- ============================================================
-- 2. FOLLOWS
-- ============================================================
create table public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(follower_id, following_id)
);

create index idx_follows_follower on public.follows(follower_id);
create index idx_follows_following on public.follows(following_id);

-- ============================================================
-- 3. POSTS
-- ============================================================
create type public.post_type as enum ('image', 'video', 'carousel', 'reel');

create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  caption text default '',
  post_type public.post_type default 'image' not null,
  location text,
  is_archived boolean default false,
  is_comments_disabled boolean default false,
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_posts_user on public.posts(user_id);
create index idx_posts_created on public.posts(created_at desc);

-- ============================================================
-- 4. POST_MEDIA (supports multiple images / carousel)
-- ============================================================
create table public.post_media (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  media_url text not null,
  media_type text not null default 'image',
  thumbnail_url text,
  width integer,
  height integer,
  duration_seconds real,
  sort_order integer default 0 not null,
  created_at timestamptz default now() not null
);

create index idx_post_media_post on public.post_media(post_id);

-- ============================================================
-- 5. LIKES
-- ============================================================
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, post_id)
);

create index idx_likes_post on public.likes(post_id);
create index idx_likes_user on public.likes(user_id);

-- ============================================================
-- 6. COMMENTS
-- ============================================================
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  content text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_comments_post on public.comments(post_id);
create index idx_comments_parent on public.comments(parent_comment_id);

-- ============================================================
-- 7. COMMENT_LIKES
-- ============================================================
create table public.comment_likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  comment_id uuid references public.comments(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, comment_id)
);

-- ============================================================
-- 8. STORIES
-- ============================================================
create table public.stories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  media_url text not null,
  media_type text not null default 'image',
  duration_seconds real default 5,
  created_at timestamptz default now() not null,
  expires_at timestamptz default (now() + interval '24 hours') not null
);

create index idx_stories_user on public.stories(user_id);
create index idx_stories_expires on public.stories(expires_at);

-- ============================================================
-- 9. STORY_VIEWS
-- ============================================================
create table public.story_views (
  id uuid default uuid_generate_v4() primary key,
  story_id uuid references public.stories(id) on delete cascade not null,
  viewer_id uuid references public.profiles(id) on delete cascade not null,
  viewed_at timestamptz default now() not null,
  unique(story_id, viewer_id)
);

-- ============================================================
-- 10. HASHTAGS
-- ============================================================
create table public.hashtags (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  post_count integer default 0,
  created_at timestamptz default now() not null
);

create index idx_hashtags_name_trgm on public.hashtags
  using gin (name gin_trgm_ops);

-- ============================================================
-- 11. POST_HASHTAGS
-- ============================================================
create table public.post_hashtags (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  hashtag_id uuid references public.hashtags(id) on delete cascade not null,
  unique(post_id, hashtag_id)
);

create index idx_post_hashtags_hashtag on public.post_hashtags(hashtag_id);

-- ============================================================
-- 12. SAVED_POSTS
-- ============================================================
create table public.saved_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, post_id)
);

-- ============================================================
-- 13. CONVERSATIONS
-- ============================================================
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  is_group boolean default false,
  group_name text,
  group_avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================
-- 14. CONVERSATION_PARTICIPANTS
-- ============================================================
create table public.conversation_participants (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz default now() not null,
  last_read_at timestamptz default now(),
  unique(conversation_id, user_id)
);

create index idx_conv_participants_user on public.conversation_participants(user_id);

-- ============================================================
-- 15. MESSAGES
-- ============================================================
create type public.message_type as enum ('text', 'image', 'video', 'post_share', 'story_reply');

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  message_type public.message_type default 'text' not null,
  media_url text,
  shared_post_id uuid references public.posts(id) on delete set null,
  is_deleted boolean default false,
  created_at timestamptz default now() not null
);

create index idx_messages_conversation on public.messages(conversation_id, created_at desc);

-- ============================================================
-- 16. NOTIFICATIONS
-- ============================================================
create type public.notification_type as enum (
  'like', 'comment', 'follow', 'follow_request',
  'mention', 'story_reply', 'comment_like'
);

create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  notification_type public.notification_type not null,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  is_read boolean default false,
  created_at timestamptz default now() not null
);

create index idx_notifications_recipient on public.notifications(recipient_id, created_at desc);
create index idx_notifications_unread on public.notifications(recipient_id) where is_read = false;

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TRIGGER: Update follow counts
-- ============================================================
create or replace function public.handle_follow_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles set followers_count = followers_count + 1 where id = new.following_id;
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.profiles set followers_count = greatest(0, followers_count - 1) where id = old.following_id;
    update public.profiles set following_count = greatest(0, following_count - 1) where id = old.follower_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_follow_change
  after insert or delete on public.follows
  for each row execute function public.handle_follow_count();

-- ============================================================
-- TRIGGER: Update like counts
-- ============================================================
create or replace function public.handle_like_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.posts set likes_count = greatest(0, likes_count - 1) where id = old.post_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_like_change
  after insert or delete on public.likes
  for each row execute function public.handle_like_count();

-- ============================================================
-- TRIGGER: Update comment counts
-- ============================================================
create or replace function public.handle_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set comments_count = comments_count + 1 where id = new.post_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.posts set comments_count = greatest(0, comments_count - 1) where id = old.post_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute function public.handle_comment_count();

-- ============================================================
-- TRIGGER: Update post counts on profile
-- ============================================================
create or replace function public.handle_post_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles set posts_count = posts_count + 1 where id = new.user_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.profiles set posts_count = greatest(0, posts_count - 1) where id = old.user_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_post_change
  after insert or delete on public.posts
  for each row execute function public.handle_post_count();

-- ============================================================
-- FUNCTION: Clean expired stories (run via cron or edge function)
-- ============================================================
create or replace function public.cleanup_expired_stories()
returns void as $$
begin
  delete from public.stories where expires_at < now();
end;
$$ language plpgsql security definer;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- PROFILES
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- FOLLOWS
alter table public.follows enable row level security;
create policy "Follows are viewable by everyone" on public.follows for select using (true);
create policy "Authenticated users can follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);

-- POSTS
alter table public.posts enable row level security;
create policy "Posts are viewable by everyone" on public.posts for select
  using (
    not is_archived
    and (
      not exists (select 1 from public.profiles where id = user_id and is_private = true)
      or auth.uid() = user_id
      or exists (select 1 from public.follows where follower_id = auth.uid() and following_id = posts.user_id)
    )
  );
create policy "Users can create own posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts" on public.posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts" on public.posts for delete using (auth.uid() = user_id);

-- POST_MEDIA
alter table public.post_media enable row level security;
create policy "Post media viewable if post is viewable" on public.post_media for select
  using (exists (select 1 from public.posts where id = post_id));
create policy "Post owner can insert media" on public.post_media for insert
  with check (exists (select 1 from public.posts where id = post_id and user_id = auth.uid()));
create policy "Post owner can delete media" on public.post_media for delete
  using (exists (select 1 from public.posts where id = post_id and user_id = auth.uid()));

-- LIKES
alter table public.likes enable row level security;
create policy "Likes are viewable by everyone" on public.likes for select using (true);
create policy "Authenticated users can like" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike" on public.likes for delete using (auth.uid() = user_id);

-- COMMENTS
alter table public.comments enable row level security;
create policy "Comments are viewable by everyone" on public.comments for select using (true);
create policy "Authenticated users can comment" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can update own comments" on public.comments for update using (auth.uid() = user_id);
create policy "Users can delete own comments" on public.comments for delete using (auth.uid() = user_id);

-- COMMENT_LIKES
alter table public.comment_likes enable row level security;
create policy "Comment likes are viewable" on public.comment_likes for select using (true);
create policy "Users can like comments" on public.comment_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike comments" on public.comment_likes for delete using (auth.uid() = user_id);

-- STORIES
alter table public.stories enable row level security;
create policy "Active stories are viewable by followers and owner" on public.stories for select
  using (
    expires_at > now()
    and (
      auth.uid() = user_id
      or exists (select 1 from public.follows where follower_id = auth.uid() and following_id = stories.user_id)
    )
  );
create policy "Users can create stories" on public.stories for insert with check (auth.uid() = user_id);
create policy "Users can delete own stories" on public.stories for delete using (auth.uid() = user_id);

-- STORY_VIEWS
alter table public.story_views enable row level security;
create policy "Story owner can see views" on public.story_views for select
  using (
    exists (select 1 from public.stories where id = story_id and user_id = auth.uid())
    or auth.uid() = viewer_id
  );
create policy "Authenticated users can mark story as viewed" on public.story_views for insert with check (auth.uid() = viewer_id);

-- HASHTAGS
alter table public.hashtags enable row level security;
create policy "Hashtags are viewable by everyone" on public.hashtags for select using (true);
create policy "Authenticated users can create hashtags" on public.hashtags for insert with check (auth.role() = 'authenticated');

-- POST_HASHTAGS
alter table public.post_hashtags enable row level security;
create policy "Post hashtags are viewable" on public.post_hashtags for select using (true);
create policy "Post owner can tag hashtags" on public.post_hashtags for insert
  with check (exists (select 1 from public.posts where id = post_id and user_id = auth.uid()));
create policy "Post owner can remove hashtags" on public.post_hashtags for delete
  using (exists (select 1 from public.posts where id = post_id and user_id = auth.uid()));

-- SAVED_POSTS
alter table public.saved_posts enable row level security;
create policy "Users can see own saved posts" on public.saved_posts for select using (auth.uid() = user_id);
create policy "Users can save posts" on public.saved_posts for insert with check (auth.uid() = user_id);
create policy "Users can unsave posts" on public.saved_posts for delete using (auth.uid() = user_id);

-- CONVERSATIONS
alter table public.conversations enable row level security;
create policy "Participants can view conversations" on public.conversations for select
  using (exists (select 1 from public.conversation_participants where conversation_id = id and user_id = auth.uid()));
create policy "Authenticated users can create conversations" on public.conversations for insert
  with check (auth.role() = 'authenticated');

-- CONVERSATION_PARTICIPANTS
alter table public.conversation_participants enable row level security;
create policy "Participants can view other participants" on public.conversation_participants for select
  using (exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = conversation_participants.conversation_id and cp.user_id = auth.uid()
  ));
create policy "Authenticated users can add participants" on public.conversation_participants for insert
  with check (auth.role() = 'authenticated');

-- MESSAGES
alter table public.messages enable row level security;
create policy "Participants can view messages" on public.messages for select
  using (exists (
    select 1 from public.conversation_participants
    where conversation_id = messages.conversation_id and user_id = auth.uid()
  ));
create policy "Participants can send messages" on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversation_participants
      where conversation_id = messages.conversation_id and user_id = auth.uid()
    )
  );

-- NOTIFICATIONS
alter table public.notifications enable row level security;
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = recipient_id);
create policy "Only service_role can create notifications" on public.notifications for insert with check (auth.role() = 'service_role');
create policy "Users can update own notifications (mark read)" on public.notifications for update using (auth.uid() = recipient_id);

-- ============================================================
-- STORAGE POLICIES
-- Remember to create these buckets in the Supabase dashboard:
--   avatars (public), posts (public), stories (public), messages (private)
-- ============================================================

create policy "Avatar images are publicly accessible" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users can upload own avatar" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can update own avatar" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete own avatar" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Post media is publicly accessible" on storage.objects for select using (bucket_id = 'posts');
create policy "Users can upload post media" on storage.objects for insert with check (bucket_id = 'posts' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete own post media" on storage.objects for delete using (bucket_id = 'posts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Story media is publicly accessible" on storage.objects for select using (bucket_id = 'stories');
create policy "Users can upload story media" on storage.objects for insert with check (bucket_id = 'stories' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete own story media" on storage.objects for delete using (bucket_id = 'stories' and auth.uid()::text = (storage.foldername(name))[1]);

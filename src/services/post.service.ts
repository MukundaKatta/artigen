import { supabase } from '@/lib/supabase';
import { FEED_PAGE_SIZE, EXPLORE_PAGE_SIZE } from '@/lib/constants';
import { uploadFile } from '@/services/upload.service';
import { extractHashtags } from '@/utils/extract-hashtags';
import { createNotification } from '@/services/notification.service';
import { updateStreak } from '@/services/streak.service';
import { checkAndAwardPostBadges } from './badge.service';
import type { FeedPost, PostWithUser, Post, AiMetadataInsert } from '@/types';
import type { Database } from '@/types/database';

type PostMediaInsert = Database['public']['Tables']['post_media']['Insert'];

// ── Feed ──────────────────────────────────────────────────────────

export async function getFeed(userId: string, page = 0) {
  const from = page * FEED_PAGE_SIZE;
  const to = from + FEED_PAGE_SIZE - 1;

  // Step 1: Get IDs of users we follow (only accepted follows)
  const { data: followData } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)
    .eq('status', 'accepted');

  const followingIds = (followData || []).map((f) => f.following_id);
  const feedUserIds = [...followingIds, userId];

  // Step 2: Fetch posts with user + media (exclude drafts, scheduled, and non-public posts)
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, user:profiles!user_id(*), media:post_media(*), ai_metadata(*)')
    .in('user_id', feedUserIds)
    .eq('is_archived', false)
    .eq('is_draft', false)
    .is('scheduled_at', null)
    .in('audience', ['everyone', 'close_friends'])
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error || !posts) return { data: [] as FeedPost[], error };

  // Step 3: Batch check likes and saves
  const postIds = posts.map((p: any) => p.id as string);

  const [likesResult, savesResult] = await Promise.all([
    supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds),
    supabase
      .from('saved_posts')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds),
  ]);

  const likedPostIds = new Set((likesResult.data || []).map((l) => l.post_id));
  const savedPostIds = new Set((savesResult.data || []).map((s) => s.post_id));

  // Step 4: Merge into FeedPost
  const feedPosts: FeedPost[] = (posts as unknown as PostWithUser[]).map(
    (post) => ({
      ...post,
      isLiked: likedPostIds.has(post.id),
      isSaved: savedPostIds.has(post.id),
    })
  );

  return { data: feedPosts, error: null };
}

// ── Single Post ───────────────────────────────────────────────────

export async function getPost(postId: string, currentUserId: string) {
  const { data: post, error } = await supabase
    .from('posts')
    .select('*, user:profiles!user_id(*), media:post_media(*), ai_metadata(*)')
    .eq('id', postId)
    .single();

  if (error || !post) return { data: null, error };

  const [likeResult, saveResult] = await Promise.all([
    supabase
      .from('likes')
      .select('id')
      .eq('user_id', currentUserId)
      .eq('post_id', postId)
      .maybeSingle(),
    supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', currentUserId)
      .eq('post_id', postId)
      .maybeSingle(),
  ]);

  const feedPost: FeedPost = {
    ...(post as unknown as PostWithUser),
    isLiked: !!likeResult.data,
    isSaved: !!saveResult.data,
  };

  return { data: feedPost, error: null };
}

// ── Create Post ───────────────────────────────────────────────────

type CreatePostParams = {
  userId: string;
  caption: string;
  location?: string;
  remixOfPostId?: string;
  audience?: 'everyone' | 'close_friends';
  mediaFiles: {
    uri: string;
    fileName: string;
    mediaType: 'image' | 'video';
    width?: number;
    height?: number;
  }[];
  aiMetadata?: Omit<AiMetadataInsert, 'post_id'>;
};

export async function createPost({
  userId,
  caption,
  location,
  remixOfPostId,
  audience,
  mediaFiles,
  aiMetadata,
}: CreatePostParams) {
  const postType =
    mediaFiles.length > 1
      ? 'carousel'
      : mediaFiles[0]?.mediaType === 'video'
        ? 'video'
        : 'image';

  // Insert the post row
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      caption,
      post_type: postType as Post['post_type'],
      location: location || null,
      remix_of_post_id: remixOfPostId || null,
      audience: audience || 'everyone',
    })
    .select('*')
    .single();

  if (postError || !post) return { data: null, error: postError };

  const postId = (post as any).id as string;

  // Upload media files and insert post_media rows
  const mediaInserts: PostMediaInsert[] = [];
  for (let i = 0; i < mediaFiles.length; i++) {
    const file = mediaFiles[i];
    const { url, error: uploadError } = await uploadFile(
      'posts',
      userId,
      file.uri,
      file.fileName
    );
    if (uploadError || !url) continue;
    mediaInserts.push({
      post_id: postId,
      media_url: url,
      media_type: file.mediaType,
      width: file.width || null,
      height: file.height || null,
      sort_order: i,
    });
  }

  if (mediaInserts.length === 0) {
    await supabase.from('posts').delete().eq('id', postId);
    return { data: null, error: { message: 'Failed to upload media' } };
  }

  await supabase.from('post_media').insert(mediaInserts);

  // Extract and link hashtags
  const hashtags = extractHashtags(caption);
  if (hashtags.length > 0) {
    await linkHashtags(postId, hashtags);
  }

  // Insert AI metadata if present
  if (aiMetadata) {
    await supabase.from('ai_metadata').insert({
      post_id: postId,
      ...aiMetadata,
    });
  }

  // Update user streak (fire-and-forget)
  updateStreak(userId).catch(() => {});
  checkAndAwardPostBadges(userId).catch(() => {});

  return { data: post, error: null };
}

// ── Hashtags (private) ────────────────────────────────────────────

async function linkHashtags(postId: string, tags: string[]) {
  for (const tag of tags) {
    let { data: existing } = await supabase
      .from('hashtags')
      .select('id, post_count')
      .eq('name', tag)
      .maybeSingle();

    if (!existing) {
      const { data: created } = await supabase
        .from('hashtags')
        .insert({ name: tag, post_count: 1 })
        .select('id')
        .single();
      if (created) {
        existing = { ...created, post_count: 1 };
      }
    } else {
      await supabase
        .from('hashtags')
        .update({ post_count: existing.post_count + 1 })
        .eq('id', existing.id);
    }

    if (existing) {
      await supabase
        .from('post_hashtags')
        .insert({ post_id: postId, hashtag_id: existing.id });
    }
  }
}

// ── Delete ────────────────────────────────────────────────────────

export async function deletePost(postId: string) {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  return { error };
}

// ── Likes ─────────────────────────────────────────────────────────

export async function likePost(userId: string, postId: string) {
  const { error } = await supabase
    .from('likes')
    .insert({ user_id: userId, post_id: postId });

  // Create notification (fire-and-forget)
  if (!error) {
    supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single()
      .then(({ data: post }) => {
        if (post && (post as any).user_id !== userId) {
          createNotification({ type: 'like', senderId: userId, recipientId: (post as any).user_id, postId });
        }
      });
  }

  return { error };
}

export async function unlikePost(userId: string, postId: string) {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);
  return { error };
}

// ── Saved Posts ───────────────────────────────────────────────────

export async function savePost(userId: string, postId: string) {
  const { error } = await supabase
    .from('saved_posts')
    .insert({ user_id: userId, post_id: postId });
  return { error };
}

export async function unsavePost(userId: string, postId: string) {
  const { error } = await supabase
    .from('saved_posts')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);
  return { error };
}

// ── Pin Posts ────────────────────────────────────────────────────

export async function pinPost(postId: string, userId: string) {
  // Check max 3 pinned posts
  const { count } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_pinned', true);

  if ((count || 0) >= 3) {
    return { error: { message: 'You can only pin up to 3 posts' } };
  }

  const { error } = await supabase
    .from('posts')
    .update({ is_pinned: true, pinned_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('user_id', userId);
  return { error };
}

export async function unpinPost(postId: string) {
  const { error } = await supabase
    .from('posts')
    .update({ is_pinned: false, pinned_at: null })
    .eq('id', postId);
  return { error };
}

// ── Reels ────────────────────────────────────────────────────────

export async function getReels(userId: string, page = 0) {
  const from = page * EXPLORE_PAGE_SIZE;
  const to = from + EXPLORE_PAGE_SIZE - 1;

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, user:profiles!user_id(*), media:post_media(*), ai_metadata(*)')
    .eq('post_type', 'reel')
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error || !posts) return { data: [] as FeedPost[], error };

  const reelIds = posts.map((p: any) => p.id as string);

  const [likesResult, savesResult] = await Promise.all([
    supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', reelIds),
    supabase
      .from('saved_posts')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', reelIds),
  ]);

  const likedPostIds = new Set((likesResult.data || []).map((l: any) => l.post_id as string));
  const savedPostIds = new Set((savesResult.data || []).map((s: any) => s.post_id as string));

  const feedPosts: FeedPost[] = (posts as unknown as PostWithUser[]).map(
    (post) => ({
      ...post,
      isLiked: likedPostIds.has(post.id),
      isSaved: savedPostIds.has(post.id),
    })
  );

  return { data: feedPosts, error: null };
}

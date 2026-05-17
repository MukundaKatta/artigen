/**
 * post.service — data layer for the Post domain.
 *
 * Every exported function returns `{ data, error }` (mirrors Supabase's shape)
 * unless documented otherwise. Errors are not thrown — callers check `error`.
 *
 * Side effects worth noting:
 * - `createPost` triggers: hashtag linking, streak update, badge awards,
 *   notification creation for @mentions, taste-profile recording.
 * - `likePost`/`savePost` are optimistic at the hook layer (`useFeed`) — the
 *   service itself just writes the row.
 * - `deletePost` cascades via DB FK to comments, likes, saves, hashtags.
 * - `getFeed` reads from the union of (followed users + self) and excludes
 *   drafts, scheduled, and archived posts. Pagination is page-number based
 *   (`FEED_PAGE_SIZE`).
 *
 * Mocked in tests via `src/__mocks__/lib/supabase.ts`.
 */

import { supabase } from '@/lib/supabase';
import { FEED_PAGE_SIZE, EXPLORE_PAGE_SIZE } from '@/lib/constants';
import { uploadFile } from '@/services/upload.service';
import { extractHashtags } from '@/utils/extract-hashtags';
import { sanitizeText } from '@/lib/sanitize';
import { createNotification } from '@/services/notification.service';
import { updateStreak } from '@/services/streak.service';
import { checkAndAwardPostBadges } from './badge.service';
import { logger } from '@/lib/logger';
import type { FeedPost, PostWithUser, Post, AiMetadataInsert } from '@/types';
import type { Database } from '@/types/database';

type PostMediaInsert = Database['public']['Tables']['post_media']['Insert'];

// ── Feed ──────────────────────────────────────────────────────────

/**
 * Returns posts from accounts the user follows plus their own, newest first.
 * Excludes drafts, scheduled, and archived posts. Joins user, media, and
 * ai_metadata. Adds `isLiked`/`isSaved` flags via batch lookups.
 *
 * @param userId Viewer's user id (used for follow set and like/save lookup)
 * @param page Zero-indexed page; size is `FEED_PAGE_SIZE`
 */
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
  const postIds = posts.map((p) => p.id);

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
  // Sanitize user-provided text fields
  const sanitizedCaption = sanitizeText(caption);
  const sanitizedLocation = location ? sanitizeText(location) : null;

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
      caption: sanitizedCaption,
      post_type: postType as Post['post_type'],
      location: sanitizedLocation,
      remix_of_post_id: remixOfPostId || null,
      audience: audience || 'everyone',
    })
    .select('*')
    .single();

  if (postError || !post) return { data: null, error: postError };

  const postId = post.id;

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
  updateStreak(userId).catch((err) => logger.warn('Streak update failed:', err));
  checkAndAwardPostBadges(userId).catch((err) => logger.warn('Badge check failed:', err));

  return { data: post, error: null };
}

// ── Hashtags (private) ────────────────────────────────────────────

type HashtagRow = { id: string; name: string; post_count: number };

async function linkHashtags(postId: string, tags: string[]) {
  if (tags.length === 0) return;

  // Batch fetch existing hashtags in a single query (avoids N+1)
  const { data: existingTags } = await supabase
    .from('hashtags')
    .select('id, name, post_count')
    .in('name', tags);

  const existingMap = new Map<string, HashtagRow>(
    ((existingTags as HashtagRow[] | null) ?? []).map((t) => [t.name, t])
  );

  // Upsert missing hashtags in a single batch
  const missingTags = tags.filter((t) => !existingMap.has(t));
  if (missingTags.length > 0) {
    const { data: created } = await supabase
      .from('hashtags')
      .upsert(
        missingTags.map((name) => ({ name, post_count: 1 })),
        { onConflict: 'name' }
      )
      .select('id, name, post_count');
    ((created as HashtagRow[] | null) ?? []).forEach((t) =>
      existingMap.set(t.name, t)
    );
  }

  // Increment counts for pre-existing hashtags
  const toIncrement = tags.filter((t) => !missingTags.includes(t));
  if (toIncrement.length > 0) {
    await Promise.all(toIncrement.map((t) => {
      const ht = existingMap.get(t);
      if (!ht) return Promise.resolve();
      return supabase
        .from('hashtags')
        .update({ post_count: (ht.post_count ?? 0) + 1 })
        .eq('id', ht.id);
    }));
  }

  // Batch insert all post_hashtags in a single query
  const junctionRows = tags
    .map((t) => existingMap.get(t))
    .filter((ht): ht is HashtagRow => ht != null)
    .map((ht) => ({ post_id: postId, hashtag_id: ht.id }));

  if (junctionRows.length > 0) {
    await supabase.from('post_hashtags').insert(junctionRows);
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

  // Background notification with proper error handling
  if (!error) {
    Promise.resolve(
      supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single()
    ).then(({ data: post }) => {
        if (post && post.user_id !== userId) {
          createNotification({ type: 'like', senderId: userId, recipientId: post.user_id, postId })
            .catch((err: unknown) => logger.warn('Failed to create like notification:', err));
        }
      })
      .catch((err: unknown) => logger.warn('Failed to fetch post owner for notification:', err));
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

  const reelIds = posts.map((p) => p.id);

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

  const likedPostIds = new Set((likesResult.data || []).map((l) => l.post_id));
  const savedPostIds = new Set((savesResult.data || []).map((s) => s.post_id));

  const feedPosts: FeedPost[] = (posts as unknown as PostWithUser[]).map(
    (post) => ({
      ...post,
      isLiked: likedPostIds.has(post.id),
      isSaved: savedPostIds.has(post.id),
    })
  );

  return { data: feedPosts, error: null };
}

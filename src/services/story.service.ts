import { supabase } from '@/lib/supabase';
import { uploadFile } from '@/services/upload.service';
import type { StoryWithUser } from '@/types/database';
import type { UserStories } from '@/types';

export async function getFollowedStories(userId: string) {
  // Get followed user IDs + self
  const { data: followData } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  const followingIds = (followData || []).map((f) => f.following_id);
  const allIds = [...followingIds, userId];

  // Get stories from last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: stories, error } = await supabase
    .from('stories')
    .select('*, user:profiles!user_id(id, username, avatar_url), views:story_views(viewer_id)')
    .in('user_id', allIds)
    .gt('expires_at', new Date().toISOString())
    .gt('created_at', oneDayAgo)
    .order('created_at', { ascending: true });

  if (error || !stories) return { data: [] as UserStories[], error };

  // Group by user
  const userMap = new Map<string, UserStories>();

  for (const story of stories as unknown as StoryWithUser[]) {
    const uid = story.user.id;
    if (!userMap.has(uid)) {
      userMap.set(uid, {
        userId: uid,
        username: story.user.username,
        avatarUrl: story.user.avatar_url,
        stories: [],
        hasUnviewed: false,
      });
    }
    const group = userMap.get(uid)!;
    group.stories.push(story);

    const isViewed = story.views.some((v) => v.viewer_id === userId);
    if (!isViewed) {
      group.hasUnviewed = true;
    }
  }

  // Sort: current user first, then unviewed, then viewed
  const result = Array.from(userMap.values()).sort((a, b) => {
    if (a.userId === userId) return -1;
    if (b.userId === userId) return 1;
    if (a.hasUnviewed && !b.hasUnviewed) return -1;
    if (!a.hasUnviewed && b.hasUnviewed) return 1;
    return 0;
  });

  return { data: result, error: null };
}

export async function getUserStories(userId: string) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('stories')
    .select('*, user:profiles!user_id(id, username, avatar_url), views:story_views(viewer_id)')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .gt('created_at', oneDayAgo)
    .order('created_at', { ascending: true });

  return { data: (data || []) as unknown as StoryWithUser[], error };
}

export async function createStory(userId: string, mediaUri: string, mediaType = 'image') {
  const fileName = `story_${Date.now()}.jpg`;
  const { url, error: uploadError } = await uploadFile('stories', userId, mediaUri, fileName);

  if (uploadError || !url) {
    return { data: null, error: uploadError || { message: 'Upload failed' } };
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('stories')
    .insert({
      user_id: userId,
      media_url: url,
      media_type: mediaType,
      duration_seconds: 5,
      expires_at: expiresAt,
    })
    .select()
    .single();

  return { data, error };
}

export async function markStoryViewed(storyId: string, viewerId: string) {
  const { error } = await supabase
    .from('story_views')
    .upsert({ story_id: storyId, viewer_id: viewerId }, { onConflict: 'story_id,viewer_id' });
  return { error };
}

export async function deleteStory(storyId: string) {
  const { error } = await supabase.from('stories').delete().eq('id', storyId);
  return { error };
}

import { supabase } from '@/lib/supabase';
import type { Profile, ProfileTopFriend } from '@/types';

export type ProfileTheme = {
  accentColor?: string;
  musicTitle?: string;
  musicArtist?: string;
};

export async function updateProfileTheme(userId: string, theme: ProfileTheme) {
  const { error } = await supabase
    .from('profiles')
    .update({ profile_theme: theme as any })
    .eq('id', userId);
  return { error };
}

export async function updateInterestTags(userId: string, tags: string[]) {
  const { error } = await supabase
    .from('profiles')
    .update({ interest_tags: tags })
    .eq('id', userId);
  return { error };
}

export async function getTopFriends(userId: string) {
  const { data, error } = await supabase
    .from('profile_top_friends')
    .select('*, friend:profiles!friend_id(id, username, full_name, avatar_url)')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error || !data) return { data: [] as Profile[], error };

  type TopFriendRow = { friend: Profile };
  const friends = (data as unknown as TopFriendRow[]).map((d) => d.friend);
  return { data: friends, error: null };
}

export async function setTopFriends(userId: string, friendIds: string[]) {
  // Delete existing
  await supabase
    .from('profile_top_friends')
    .delete()
    .eq('user_id', userId);

  // Insert new
  if (friendIds.length > 0) {
    const inserts = friendIds.map((friendId, index) => ({
      user_id: userId,
      friend_id: friendId,
      sort_order: index,
    }));

    const { error } = await supabase
      .from('profile_top_friends')
      .insert(inserts);
    return { error };
  }

  return { error: null };
}

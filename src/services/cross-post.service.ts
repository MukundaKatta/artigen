import { supabase } from '@/lib/supabase';

export type CrossPostAccount = {
  id: string;
  user_id: string;
  platform: string;
  platform_username: string | null;
  is_connected: boolean;
  created_at: string;
};

export type CrossPost = {
  id: string;
  post_id: string;
  user_id: string;
  platform: string;
  platform_post_id: string | null;
  status: 'pending' | 'posting' | 'posted' | 'failed';
  error_message: string | null;
  posted_at: string | null;
  created_at: string;
};

export const SUPPORTED_PLATFORMS = [
  'photo',
  'twitter',
  'tiktok',
  'facebook',
  'pinterest',
  'threads',
] as const;

export type Platform = (typeof SUPPORTED_PLATFORMS)[number];

export async function getAccounts(userId: string) {
  const { data, error } = await supabase
    .from('cross_post_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  return { data: (data || []) as CrossPostAccount[], error };
}

export async function connectAccount(userId: string, platform: string, username: string) {
  const { data, error } = await supabase
    .from('cross_post_accounts')
    .upsert(
      {
        user_id: userId,
        platform,
        platform_username: username,
        is_connected: true,
      },
      { onConflict: 'user_id,platform' }
    )
    .select()
    .single();

  return { data: data as CrossPostAccount | null, error };
}

export async function disconnectAccount(accountId: string) {
  const { error } = await supabase
    .from('cross_post_accounts')
    .update({ is_connected: false, access_token_encrypted: null })
    .eq('id', accountId);

  return { error };
}

export async function crossPost(postId: string, userId: string, platforms: string[]) {
  const inserts = platforms.map((platform) => ({
    post_id: postId,
    user_id: userId,
    platform,
    status: 'pending' as const,
  }));

  const { data, error } = await supabase
    .from('cross_posts')
    .insert(inserts)
    .select();

  // Trigger edge function for each cross post (fire and forget)
  if (data && data.length > 0) {
    for (const cp of data) {
      supabase.functions.invoke('cross-post', {
        body: { crossPostId: cp.id },
      }).catch(() => {
        // Fire-and-forget; edge function handles status updates
      });
    }
  }

  return { data: (data || []) as CrossPost[], error };
}

export async function getCrossPostStatus(postId: string) {
  const { data, error } = await supabase
    .from('cross_posts')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  return { data: (data || []) as CrossPost[], error };
}

export async function getMyCrossPosts(userId: string, page = 0) {
  const PAGE_SIZE = 20;
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('cross_posts')
    .select('*, post:posts(*, media:post_media(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: (data || []) as CrossPost[], error };
}

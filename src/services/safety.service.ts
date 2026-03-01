import { supabase } from '@/lib/supabase';

export async function getContentLabel(postId: string) {
  const { data, error } = await supabase
    .from('content_labels')
    .select('*')
    .eq('post_id', postId)
    .maybeSingle();
  return { data, error };
}

export async function getSafetyPreferences(userId: string) {
  const { data, error } = await supabase
    .from('safety_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return { data, error };
}

export async function updateSafetyPreferences(userId: string, prefs: {
  showSensitive?: boolean;
  showMature?: boolean;
  blurNsfw?: boolean;
  ageVerified?: boolean;
}) {
  const { data, error } = await supabase
    .from('safety_preferences')
    .upsert({
      user_id: userId,
      ...(prefs.showSensitive !== undefined && { show_sensitive: prefs.showSensitive }),
      ...(prefs.showMature !== undefined && { show_mature: prefs.showMature }),
      ...(prefs.blurNsfw !== undefined && { blur_nsfw: prefs.blurNsfw }),
      ...(prefs.ageVerified !== undefined && { age_verified: prefs.ageVerified }),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();
  return { data, error };
}

export async function rateContent(postId: string, userId: string, rating: 'safe' | 'sensitive' | 'mature' | 'nsfw') {
  const { error } = await supabase
    .from('content_ratings')
    .upsert({ post_id: postId, user_id: userId, rating }, { onConflict: 'post_id,user_id' });
  return { error };
}

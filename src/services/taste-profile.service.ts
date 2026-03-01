import { supabase } from '@/lib/supabase';

export async function getTasteProfile(userId: string) {
  const { data, error } = await supabase
    .from('taste_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return { data, error };
}

export async function updateTasteProfile(userId: string, updates: {
  preferredStyles?: string[];
  preferredModels?: string[];
  preferredThemes?: string[];
  preferredPalettes?: string[];
  dislikedStyles?: string[];
  dislikedThemes?: string[];
}) {
  const { data, error } = await supabase
    .from('taste_profiles')
    .upsert({
      user_id: userId,
      ...(updates.preferredStyles && { preferred_styles: updates.preferredStyles }),
      ...(updates.preferredModels && { preferred_models: updates.preferredModels }),
      ...(updates.preferredThemes && { preferred_themes: updates.preferredThemes }),
      ...(updates.preferredPalettes && { preferred_palettes: updates.preferredPalettes }),
      ...(updates.dislikedStyles && { disliked_styles: updates.dislikedStyles }),
      ...(updates.dislikedThemes && { disliked_themes: updates.dislikedThemes }),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  return { data, error };
}

type SignalType = 'view' | 'like' | 'save' | 'comment' | 'share' | 'long_view' | 'skip';

export async function recordEngagement(userId: string, postId: string, signalType: SignalType, styleTags: string[] = []) {
  const { error } = await supabase
    .from('engagement_signals')
    .insert({
      user_id: userId,
      post_id: postId,
      signal_type: signalType,
      style_tags: styleTags,
    });
  return { error };
}

export async function getPersonalizedFeed(userId: string, page = 0, pageSize = 10) {
  const { data, error } = await supabase.rpc('get_personalized_feed', {
    target_user_id: userId,
    page_offset: page * pageSize,
    page_limit: pageSize,
  });
  return { data, error };
}

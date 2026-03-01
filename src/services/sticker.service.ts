import { supabase } from '@/lib/supabase';
import type { StorySticker, StickerResponse } from '@/types';

export type StickerType = StorySticker['sticker_type'];

export async function getStoryStickers(storyId: string) {
  const { data, error } = await supabase
    .from('story_stickers')
    .select('*')
    .eq('story_id', storyId);

  return { data: (data || []) as unknown as StorySticker[], error };
}

export async function createSticker(
  storyId: string,
  stickerType: StickerType,
  config: Record<string, unknown>,
  posX = 0.5,
  posY = 0.5
) {
  const { data, error } = await supabase
    .from('story_stickers')
    .insert({
      story_id: storyId,
      sticker_type: stickerType,
      config,
      position_x: posX,
      position_y: posY,
    })
    .select()
    .single();

  return { data: data as unknown as StorySticker | null, error };
}

export async function respondToSticker(stickerId: string, userId: string, response: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('story_sticker_responses')
    .upsert(
      { sticker_id: stickerId, user_id: userId, response },
      { onConflict: 'sticker_id,user_id' }
    )
    .select()
    .single();

  return { data: data as unknown as StickerResponse | null, error };
}

export async function getStickerResponses(stickerId: string) {
  const { data, error } = await supabase
    .from('story_sticker_responses')
    .select('*, user:profiles!user_id(id, username, avatar_url)')
    .eq('sticker_id', stickerId);

  return { data: data || [], error };
}

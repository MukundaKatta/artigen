import { supabase } from '@/lib/supabase';

export type ArPreview = {
  id: string;
  post_id: string;
  frame_style: FrameStyle;
  default_width_cm: number;
  default_height_cm: number;
  created_at: string;
};

export type FrameStyle = 'none' | 'thin_black' | 'thin_white' | 'gallery' | 'modern' | 'ornate';

export const FRAME_STYLES: { value: FrameStyle; label: string }[] = [
  { value: 'none', label: 'No Frame' },
  { value: 'thin_black', label: 'Thin Black' },
  { value: 'thin_white', label: 'Thin White' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'modern', label: 'Modern' },
  { value: 'ornate', label: 'Ornate' },
];

export async function getArPreview(postId: string) {
  const { data, error } = await supabase
    .from('ar_previews')
    .select('*')
    .eq('post_id', postId)
    .maybeSingle();

  return { data: data as ArPreview | null, error };
}

export async function createArPreview(
  postId: string,
  frameStyle: FrameStyle,
  widthCm: number,
  heightCm: number
) {
  const { data, error } = await supabase
    .from('ar_previews')
    .insert({
      post_id: postId,
      frame_style: frameStyle,
      default_width_cm: widthCm,
      default_height_cm: heightCm,
    })
    .select()
    .single();

  return { data: data as ArPreview | null, error };
}

export async function updateArPreview(
  postId: string,
  updates: { frame_style?: FrameStyle; default_width_cm?: number; default_height_cm?: number }
) {
  const { data, error } = await supabase
    .from('ar_previews')
    .update(updates)
    .eq('post_id', postId)
    .select()
    .single();

  return { data: data as ArPreview | null, error };
}

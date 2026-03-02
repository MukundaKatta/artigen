import { supabase } from '@/lib/supabase';
import { generateImage } from './ai.service';

export type ComicPanel = {
  id: string;
  panelNumber: number;
  description: string;
  imageUrl: string | null;
  generating: boolean;
  error: string | null;
};

export type ComicStyle =
  | 'manga'
  | 'western_comic'
  | 'watercolor'
  | 'pixel_art'
  | 'studio_ghibli'
  | 'dark_knight';

export const COMIC_STYLES: { value: ComicStyle; label: string; suffix: string }[] = [
  { value: 'manga', label: 'Manga', suffix: 'manga style, black and white ink, detailed linework, anime aesthetic' },
  { value: 'western_comic', label: 'Comic Book', suffix: 'western comic book style, bold colors, cel shaded, dynamic lighting' },
  { value: 'watercolor', label: 'Watercolor', suffix: 'watercolor illustration, soft edges, painterly style, pastel palette' },
  { value: 'pixel_art', label: 'Pixel Art', suffix: 'pixel art style, 16-bit, retro game aesthetic, clean pixels' },
  { value: 'studio_ghibli', label: 'Ghibli', suffix: 'Studio Ghibli style, hand-drawn, whimsical, detailed background, soft animation' },
  { value: 'dark_knight', label: 'Dark', suffix: 'dark graphic novel style, high contrast, noir, gritty, dramatic shadows' },
];

/** Break a plot synopsis into panel descriptions via Supabase/LLM or simple splitting */
export function splitPlotToPanels(plot: string, panelCount: number): string[] {
  // Simple heuristic: split by sentences, then distribute
  const sentences = plot
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length === 0) return Array(panelCount).fill(plot);

  const panels: string[] = [];
  for (let i = 0; i < panelCount; i++) {
    const idx = Math.floor((i / panelCount) * sentences.length);
    panels.push(sentences[idx] || sentences[sentences.length - 1]);
  }
  return panels;
}

/** Build a generation prompt for a single comic panel */
export function buildPanelPrompt(
  panelDescription: string,
  style: ComicStyle,
  characterContext: string,
  panelNumber: number,
  totalPanels: number
): string {
  const styleInfo = COMIC_STYLES.find((s) => s.value === style)!;
  const position =
    panelNumber === 1
      ? 'establishing shot'
      : panelNumber === totalPanels
      ? 'dramatic final panel'
      : 'action panel';

  const characterPart = characterContext ? `, featuring ${characterContext}` : '';

  return `comic panel ${panelNumber} of ${totalPanels}, ${position}, ${panelDescription}${characterPart}, ${styleInfo.suffix}, no speech bubbles, no text overlay, high quality, detailed`;
}

/** Save a completed comic as a post */
export async function saveComicPost(
  userId: string,
  panels: ComicPanel[],
  title: string,
  plot: string,
  style: ComicStyle
): Promise<{ data: { id: string } | null; error: string | null }> {
  const imageUrls = panels.map((p) => p.imageUrl).filter(Boolean) as string[];
  if (imageUrls.length === 0) return { data: null, error: 'No images to save' };

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      caption: `📖 ${title}\n\n${plot}`,
    })
    .select('id')
    .single();

  if (error) return { data: null, error: error.message };

  // Insert each panel as post_media
  await supabase.from('post_media').insert(
    imageUrls.map((url, i) => ({
      post_id: (data as { id: string }).id,
      media_url: url,
      media_type: 'image' as const,
      width: 768,
      height: 768,
      order_index: i,
    }))
  );

  // Attach ai_metadata with plot as prompt
  await supabase.from('ai_metadata').insert({
    post_id: (data as { id: string }).id,
    prompt: plot,
    model_id: 'black-forest-labs/FLUX.1-schnell',
    model_name: 'Flux Schnell',
    generation_time_ms: 0,
    settings: { title, style, panelCount: panels.length, type: 'comic' },
  });
  return { data: data as { id: string }, error: null };
}

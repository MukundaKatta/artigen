import { supabase } from '@/lib/supabase';

export type CaptionTone = 'casual' | 'professional' | 'funny' | 'poetic' | 'minimal';

const TONE_PROMPTS: Record<CaptionTone, string> = {
  casual: 'Write a casual, friendly social media caption for this image. Keep it relatable and use everyday language.',
  professional: 'Write a professional, polished social media caption for this image. Keep it clean and brand-worthy.',
  funny: 'Write a funny, witty social media caption for this image. Include humor or a clever pun.',
  poetic: 'Write a poetic, artistic social media caption for this image. Use vivid imagery and metaphor.',
  minimal: 'Write a minimal, short social media caption for this image. Maximum 10 words, no hashtags.',
};

export async function generateCaption(imageUrl: string, tone: CaptionTone): Promise<{ data: string | null; error: Error | null }> {
  try {
    // Call edge function for caption generation
    const { data, error } = await supabase.functions.invoke('generate-caption', {
      body: {
        image_url: imageUrl,
        prompt: TONE_PROMPTS[tone],
        tone,
      },
    });

    if (error) return { data: null, error };
    const captionData = data as { caption?: string } | null;
    return { data: captionData?.caption || null, error: null };
  } catch {
    // Fallback: generate a simple caption locally based on tone
    const fallbacks: Record<CaptionTone, string[]> = {
      casual: ['Living my best life', 'Good vibes only', 'Another day, another adventure'],
      professional: ['Grateful for moments like these', 'Excellence in every detail', 'Making it happen'],
      funny: ['I woke up like this... just kidding', 'My therapist says I need to express myself', 'Plot twist'],
      poetic: ['In the silence between heartbeats', 'Chasing light through infinite corridors', 'A moment suspended in amber'],
      minimal: ['This.', 'Mood.', 'Here.'],
    };

    const options = fallbacks[tone];
    const caption = options[Math.floor(Math.random() * options.length)];
    return { data: caption, error: null };
  }
}

export const TONE_LABELS: Record<CaptionTone, string> = {
  casual: 'Casual',
  professional: 'Professional',
  funny: 'Funny',
  poetic: 'Poetic',
  minimal: 'Minimal',
};

export const CAPTION_TONES: CaptionTone[] = ['casual', 'professional', 'funny', 'poetic', 'minimal'];

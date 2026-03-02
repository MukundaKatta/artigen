import { supabase } from '@/lib/supabase';

export type DimensionScore = {
  score: number;
  feedback: string;
};

export type ArtCritique = {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  dimensions: {
    composition: DimensionScore;
    colorPalette: DimensionScore;
    detail: DimensionScore;
    creativity: DimensionScore;
    promptCraft: DimensionScore;
  };
  promptSuggestions: string[];
  styleNotes: string;
  moodTags: string[];
};

export async function analyzeArtwork(
  imageUrl: string,
  prompt?: string
): Promise<{ data: ArtCritique | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('art-coach', {
    body: { imageUrl, prompt },
  });

  if (error) {
    let msg = error.message || 'Analysis failed';
    try {
      if (typeof error.context === 'object' && error.context?.body) {
        const body = await new Response(error.context.body).json();
        if (body?.error) msg = body.error;
      }
    } catch { /* use default */ }
    return { data: null, error: msg };
  }

  if (data?.error) return { data: null, error: data.error };
  return { data: data.critique as ArtCritique, error: null };
}

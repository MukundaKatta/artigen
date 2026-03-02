import { supabase } from '@/lib/supabase';
import { generateImage } from './ai.service';

export type GeneticTrait = {
  name: string;
  fromParent: 'a' | 'b' | 'blend';
  weight: number; // 0-100, how much of this trait is in the offspring
};

export type BreedResult = {
  imageUrl: string;
  offspringPrompt: string;
  traits: GeneticTrait[];
};

type PostData = {
  image_url: string;
  prompt: string | null;
  style_tags: string[] | null;
};

async function fetchPost(postId: string): Promise<PostData | null> {
  const { data } = await supabase
    .from('posts')
    .select('image_url, prompt, style_tags')
    .eq('id', postId)
    .single();
  return data as PostData | null;
}

/** Extract style keywords from a prompt string */
function extractKeywords(prompt: string): string[] {
  const stopWords = new Set(['a', 'an', 'the', 'of', 'and', 'with', 'in', 'on', 'at', 'by', 'for', 'no', 'text']);
  return prompt
    .toLowerCase()
    .split(/[\s,]+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter((w) => w.length > 3 && !stopWords.has(w));
}

/** Randomly blend two keyword arrays, favouring random pick from each */
function blendKeywords(a: string[], b: string[], blendRatio = 0.5): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const word of a) {
    if (!seen.has(word) && Math.random() < (1 - blendRatio * 0.5)) {
      seen.add(word);
      result.push(word);
    }
  }
  for (const word of b) {
    if (!seen.has(word) && Math.random() < (1 - (1 - blendRatio) * 0.5)) {
      seen.add(word);
      result.push(word);
    }
  }

  return result;
}

/** Build genetic traits summary for display */
function buildTraits(promptA: string, promptB: string, blendedPrompt: string): GeneticTrait[] {
  const kwA = extractKeywords(promptA);
  const kwB = extractKeywords(promptB);
  const kwBlended = extractKeywords(blendedPrompt);

  const traits: GeneticTrait[] = [];
  const seen = new Set<string>();

  for (const kw of kwBlended) {
    if (seen.has(kw) || traits.length >= 6) break;
    seen.add(kw);
    const inA = kwA.includes(kw);
    const inB = kwB.includes(kw);
    traits.push({
      name: kw,
      fromParent: inA && inB ? 'blend' : inA ? 'a' : 'b',
      weight: inA && inB ? 50 + Math.round(Math.random() * 30) : inA ? 70 + Math.round(Math.random() * 20) : 65 + Math.round(Math.random() * 25),
    });
  }

  return traits;
}

export async function breedArtworks(
  postIdA: string,
  postIdB: string
): Promise<{ data: BreedResult | null; error: string | null }> {
  const [postA, postB] = await Promise.all([fetchPost(postIdA), fetchPost(postIdB)]);

  if (!postA || !postB) return { data: null, error: 'Could not load artworks' };

  const promptA = postA.prompt ?? (postA.style_tags?.join(', ') ?? 'digital art');
  const promptB = postB.prompt ?? (postB.style_tags?.join(', ') ?? 'digital art');

  const kwA = extractKeywords(promptA);
  const kwB = extractKeywords(promptB);
  const blendedKw = blendKeywords(kwA, kwB, 0.5);

  const offspringPrompt = [
    ...blendedKw.slice(0, 12),
    'masterpiece, highly detailed, award winning',
  ].join(', ');

  const { data, error } = await generateImage({
    prompt: offspringPrompt,
    model_id: 'black-forest-labs/FLUX.1-schnell',
    provider: 'huggingface',
    width: 1024,
    height: 1024,
  });

  if (error || !data?.image_url) return { data: null, error: error ?? 'Generation failed' };

  return {
    data: {
      imageUrl: data.image_url,
      offspringPrompt,
      traits: buildTraits(promptA, promptB, offspringPrompt),
    },
    error: null,
  };
}

export async function saveOffspringPost(
  userId: string,
  offspringImageUrl: string,
  offspringPrompt: string,
  parentPostIdA: string,
  parentPostIdB: string
): Promise<{ data: { id: string } | null; error: string | null }> {
  // Insert post record (no image_url/prompt cols — those live in post_media/ai_metadata)
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      caption: `🧬 Born from Art Genetics\n\nPrompt: ${offspringPrompt.slice(0, 200)}`,
    })
    .select('id')
    .single();

  if (postError || !post) return { data: null, error: postError?.message ?? 'Failed to create post' };

  // Attach image in post_media
  await supabase.from('post_media').insert({
    post_id: post.id,
    media_url: offspringImageUrl,
    media_type: 'image',
    width: 1024,
    height: 1024,
    order_index: 0,
  });

  // Attach ai_metadata
  await supabase.from('ai_metadata').insert({
    post_id: post.id,
    prompt: offspringPrompt,
    model_id: 'black-forest-labs/FLUX.1-schnell',
    model_name: 'Flux Schnell',
    generation_time_ms: 0,
    settings: { parentPostIdA, parentPostIdB, type: 'genetics_offspring' },
  });

  return { data: { id: post.id }, error: null };
}

import { supabase } from '@/lib/supabase';

export type GenerationRecord = {
  id: string;
  user_id: string;
  prompt: string;
  negative_prompt: string | null;
  model_id: string;
  model_name: string;
  provider: string;
  image_url: string;
  generation_time_ms: number;
  credits_used: number;
  settings: Record<string, unknown>;
  created_at: string;
};

export async function saveGeneration(
  userId: string,
  data: {
    prompt: string;
    negative_prompt?: string;
    model_id: string;
    model_name: string;
    provider: string;
    image_url: string;
    generation_time_ms: number;
    credits_used: number;
    settings: Record<string, unknown>;
  },
): Promise<void> {
  await supabase.from('generation_history').insert({
    user_id: userId,
    ...data,
  });
}

export async function getGenerationHistory(
  userId: string,
  page = 0,
  limit = 20,
): Promise<GenerationRecord[]> {
  const { data } = await supabase.from('generation_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  return (data || []) as GenerationRecord[];
}

export async function deleteGeneration(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase.from('generation_history')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  return !error;
}

import { supabase } from '@/lib/supabase';

export async function getTrendingPrompts(limit = 20) {
  const { data, error } = await supabase
    .from('trending_prompts')
    .select('*')
    .order('use_count', { ascending: false })
    .order('total_likes', { ascending: false })
    .limit(limit);
  return { data, error };
}

export async function getTrendingStyles(limit = 20) {
  const { data, error } = await supabase
    .from('trending_styles')
    .select('*')
    .order('post_count', { ascending: false })
    .order('total_likes', { ascending: false })
    .limit(limit);
  return { data, error };
}

import { supabase } from '@/lib/supabase';
import type { PromptLibraryInsert } from '@/types';

const PAGE_SIZE = 20;

// ── CRUD ────────────────────────────────────────────

export async function createPrompt(prompt: PromptLibraryInsert) {
  const { data, error } = await supabase
    .from('prompt_library')
    .insert(prompt)
    .select()
    .single();

  return { data, error };
}

export async function updatePrompt(id: string, updates: Partial<PromptLibraryInsert>) {
  const { data, error } = await supabase
    .from('prompt_library')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deletePrompt(id: string) {
  const { error } = await supabase
    .from('prompt_library')
    .delete()
    .eq('id', id);

  return { error };
}

// ── Fetch ───────────────────────────────────────────

export async function getPublicPrompts(page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('prompt_library')
    .select('*, user:profiles!user_id(id, username, avatar_url)')
    .eq('is_public', true)
    .order('save_count', { ascending: false })
    .range(from, to);

  return { data: data || [], error };
}

export async function getUserPrompts(userId: string, page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('prompt_library')
    .select('*, user:profiles!user_id(id, username, avatar_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: data || [], error };
}

export async function searchPrompts(query: string, page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('prompt_library')
    .select('*, user:profiles!user_id(id, username, avatar_url)')
    .eq('is_public', true)
    .or(`title.ilike.%${query}%,prompt.ilike.%${query}%`)
    .order('save_count', { ascending: false })
    .range(from, to);

  return { data: data || [], error };
}

// ── Save / Unsave ───────────────────────────────────

export async function savePrompt(userId: string, promptId: string) {
  const { error } = await supabase
    .from('prompt_saves')
    .insert({ user_id: userId, prompt_id: promptId });

  // Increment save_count (fire-and-forget)
  if (!error) {
    supabase
      .from('prompt_library')
      .select('save_count')
      .eq('id', promptId)
      .single()
      .then(({ data }) => {
        if (data) {
          supabase
            .from('prompt_library')
            .update({ save_count: (data.save_count || 0) + 1 })
            .eq('id', promptId);
        }
      });
  }

  return { error };
}

export async function unsavePrompt(userId: string, promptId: string) {
  const { error } = await supabase
    .from('prompt_saves')
    .delete()
    .eq('user_id', userId)
    .eq('prompt_id', promptId);

  return { error };
}

export async function getPromptById(id: string) {
  const { data, error } = await supabase
    .from('prompt_library')
    .select('*')
    .eq('id', id)
    .single();

  return { data: data || null, error };
}

export async function getSavedPrompts(userId: string, page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('prompt_saves')
    .select('*, prompt:prompt_library!prompt_id(*, user:profiles!user_id(id, username, avatar_url))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: data || [], error };
}

export async function getTrendingPrompts(limit = 6) {
  const { data, error } = await supabase.from('prompt_library')
    .select('id, title, prompt, model_id, save_count, user:profiles!user_id(username)')
    .eq('is_public', true)
    .order('save_count', { ascending: false })
    .limit(limit);

  return { data: data || [], error };
}

export async function isPromptSaved(userId: string, promptId: string) {
  const { data } = await supabase
    .from('prompt_saves')
    .select('id')
    .eq('user_id', userId)
    .eq('prompt_id', promptId)
    .maybeSingle();

  return !!data;
}

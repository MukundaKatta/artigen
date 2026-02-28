import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function getProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  return { data, error };
}

export async function updateProfile(userId: string, updates: ProfileUpdate) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
}

export async function searchUsers(query: string, limit = 20) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, is_verified')
    .ilike('username', `%${query}%`)
    .limit(limit);
  return { data, error };
}

export async function ensureProfile(userId: string, username: string, fullName: string) {
  // Check if profile already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (existing) return { data: existing, error: null };

  // Profile doesn't exist (trigger failed) — create it from the client
  // Handle username conflicts by appending random suffix
  let finalUsername = username || `user_${userId.slice(0, 8)}`;
  const { data: taken } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', finalUsername)
    .maybeSingle();

  if (taken) {
    finalUsername = `${finalUsername}_${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, username: finalUsername, full_name: fullName || '' })
    .select()
    .single();

  return { data, error };
}

export async function checkUsernameAvailable(username: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();
  return { available: !data, error };
}

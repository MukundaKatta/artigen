import { supabase } from '@/lib/supabase';
import type { Location } from '@/types';

/**
 * Case-insensitive prefix/substring search over location names, ordered by
 * popularity (post_count desc), capped at 20 results. Caller should debounce
 * + enforce a min query length before calling.
 */
export async function searchLocations(query: string) {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('post_count', { ascending: false })
    .limit(20);

  return { data: (data || []) as unknown as Location[], error };
}

export async function getLocation(locationId: string) {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', locationId)
    .single();

  return { data: data as unknown as Location | null, error };
}

/**
 * Idempotent get-or-create by exact name: returns the existing location if one
 * matches, otherwise inserts a new row. Used when tagging a post with a place
 * the user typed in. Note: matches on `name` only — two distinct venues sharing
 * a name will collide (acceptable for the current tagging UX).
 */
export async function getOrCreateLocation(name: string, address?: string, lat?: number, lng?: number) {
  // Try to find existing
  const { data: existing } = await supabase
    .from('locations')
    .select('*')
    .eq('name', name)
    .maybeSingle();

  if (existing) return { data: existing as unknown as Location, error: null };

  // Create new
  const { data, error } = await supabase
    .from('locations')
    .insert({ name, address: address || null, lat: lat || null, lng: lng || null })
    .select()
    .single();

  return { data: data as unknown as Location | null, error };
}

export async function getLocationPosts(locationId: string, page = 0) {
  const pageSize = 30;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('posts')
    .select('*, user:profiles!user_id(*), media:post_media(*)')
    .eq('location_id', locationId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: data || [], error };
}

/**
 * Find locations within ~`radiusKm` of a point using a simple lat/lng bounding
 * box (not a true great-circle radius — corners extend slightly past the
 * radius). Ordered by post_count desc, capped at 50.
 */
export async function getNearbyLocations(lat: number, lng: number, radiusKm = 10) {
  // Simple bounding box query
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .gte('lat', lat - latDelta)
    .lte('lat', lat + latDelta)
    .gte('lng', lng - lngDelta)
    .lte('lng', lng + lngDelta)
    .order('post_count', { ascending: false })
    .limit(50);

  return { data: (data || []) as unknown as Location[], error };
}

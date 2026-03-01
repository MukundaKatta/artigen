import { supabase } from '@/lib/supabase';
import type { Collection } from '@/types';

export async function getCollections(userId: string) {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data: (data || []) as unknown as Collection[], error };
}

export async function createCollection(userId: string, name: string) {
  const { data, error } = await supabase
    .from('collections')
    .insert({ user_id: userId, name })
    .select()
    .single();

  return { data: data as unknown as Collection | null, error };
}

export async function updateCollection(collectionId: string, updates: { name?: string; cover_url?: string }) {
  const { data, error } = await supabase
    .from('collections')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', collectionId)
    .select()
    .single();

  return { data: data as unknown as Collection | null, error };
}

export async function deleteCollection(collectionId: string) {
  // Move saved posts back to unsorted
  await supabase
    .from('saved_posts')
    .update({ collection_id: null })
    .eq('collection_id', collectionId);

  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId);

  return { error };
}

export async function savePostToCollection(userId: string, postId: string, collectionId: string | null) {
  // Update existing saved post's collection, or create a new save
  const { data: existing } = await supabase
    .from('saved_posts')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('saved_posts')
      .update({ collection_id: collectionId })
      .eq('id', existing.id);
    return { error };
  }

  const { error } = await supabase
    .from('saved_posts')
    .insert({ user_id: userId, post_id: postId, collection_id: collectionId });
  return { error };
}

export async function getCollectionPosts(collectionId: string) {
  const { data, error } = await supabase
    .from('saved_posts')
    .select('post_id, posts(*, user:profiles!user_id(*), media:post_media(*))')
    .eq('collection_id', collectionId)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

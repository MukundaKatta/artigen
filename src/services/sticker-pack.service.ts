import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 20;

export async function createPack(creatorId: string, name: string, description?: string) {
  const { data, error } = await supabase
    .from('sticker_packs')
    .insert({
      creator_id: creatorId,
      name,
      description,
    })
    .select()
    .single();
  return { data, error };
}

export async function addSticker(packId: string, imageUrl: string, label?: string) {
  // Get current max sort_order
  const { data: existing } = await supabase
    .from('stickers')
    .select('sort_order')
    .eq('pack_id', packId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? (existing[0].sort_order ?? 0) + 1 : 0;

  const { data, error } = await supabase
    .from('stickers')
    .insert({
      pack_id: packId,
      image_url: imageUrl,
      label,
      sort_order: nextOrder,
    })
    .select()
    .single();

  // Update sticker_count
  if (data) {
    supabase
      .from('stickers')
      .select('id', { count: 'exact', head: true })
      .eq('pack_id', packId)
      .then(({ count }) => {
        if (count !== null) {
          supabase.from('sticker_packs').update({ sticker_count: count }).eq('id', packId);
        }
      });
  }

  return { data, error };
}

export async function removeSticker(stickerId: string) {
  // Get pack_id before deleting
  const { data: sticker } = await supabase
    .from('stickers')
    .select('pack_id')
    .eq('id', stickerId)
    .single();

  const { error } = await supabase
    .from('stickers')
    .delete()
    .eq('id', stickerId);

  // Update sticker_count
  if (!error && sticker) {
    supabase
      .from('stickers')
      .select('id', { count: 'exact', head: true })
      .eq('pack_id', sticker.pack_id)
      .then(({ count }) => {
        if (count !== null) {
          supabase.from('sticker_packs').update({ sticker_count: count }).eq('id', sticker.pack_id);
        }
      });
  }

  return { error };
}

export async function getPack(packId: string) {
  const { data, error } = await supabase
    .from('sticker_packs')
    .select('*, creator:profiles(id, username, avatar_url)')
    .eq('id', packId)
    .single();
  return { data, error };
}

export async function getPublicPacks(page: number = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('sticker_packs')
    .select('*, creator:profiles(id, username, avatar_url)')
    .eq('is_public', true)
    .order('download_count', { ascending: false })
    .range(from, to);
  return { data, error };
}

export async function getMyPacks(userId: string) {
  const { data, error } = await supabase
    .from('sticker_packs')
    .select('*')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getSavedPacks(userId: string) {
  const { data, error } = await supabase
    .from('user_sticker_packs')
    .select('*, pack:sticker_packs(*, creator:profiles(id, username, avatar_url))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function savePack(userId: string, packId: string) {
  const { data, error } = await supabase
    .from('user_sticker_packs')
    .insert({ user_id: userId, pack_id: packId })
    .select()
    .single();

  // Increment download_count
  if (data) {
    supabase.from('sticker_packs')
      .select('download_count')
      .eq('id', packId)
      .single()
      .then(({ data: pack }) => {
        if (pack) {
          supabase.from('sticker_packs').update({ download_count: (pack.download_count || 0) + 1 }).eq('id', packId);
        }
      });
  }

  return { data, error };
}

export async function unsavePack(userId: string, packId: string) {
  const { error } = await supabase
    .from('user_sticker_packs')
    .delete()
    .eq('user_id', userId)
    .eq('pack_id', packId);
  return { error };
}

export async function getPackStickers(packId: string) {
  const { data, error } = await supabase
    .from('stickers')
    .select('*')
    .eq('pack_id', packId)
    .order('sort_order', { ascending: true });
  return { data, error };
}

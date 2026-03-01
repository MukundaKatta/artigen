import { supabase } from '@/lib/supabase';

export async function createListing(params: {
  postId: string;
  sellerId: string;
  listingType: 'digital_download' | 'print_on_demand';
  title: string;
  description?: string;
  priceCents: number;
  digitalFileUrl?: string;
  printOptions?: unknown[];
}) {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .insert({
      post_id: params.postId,
      seller_id: params.sellerId,
      listing_type: params.listingType,
      title: params.title,
      description: params.description || '',
      price_cents: params.priceCents,
      digital_file_url: params.digitalFileUrl,
      print_options: params.printOptions || [],
    })
    .select()
    .single();

  if (data) {
    await supabase.from('posts').update({ has_listing: true }).eq('id', params.postId);
  }
  return { data, error };
}

export async function updateListing(listingId: string, updates: {
  title?: string;
  description?: string;
  priceCents?: number;
  isActive?: boolean;
  printOptions?: unknown[];
}) {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .update({
      ...(updates.title && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.priceCents !== undefined && { price_cents: updates.priceCents }),
      ...(updates.isActive !== undefined && { is_active: updates.isActive }),
      ...(updates.printOptions && { print_options: updates.printOptions }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .select()
    .single();
  return { data, error };
}

export async function deleteListing(listingId: string) {
  const { error } = await supabase
    .from('marketplace_listings')
    .delete()
    .eq('id', listingId);
  return { error };
}

export async function getListing(listingId: string) {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('*, seller:profiles!seller_id(id, username, avatar_url, full_name), post:posts!post_id(*, media:post_media(*))')
    .eq('id', listingId)
    .single();
  return { data, error };
}

export async function getListingsForSeller(sellerId: string) {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('*, post:posts!post_id(*, media:post_media(*))')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function searchListings(query?: string, page = 0, pageSize = 20) {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  let q = supabase
    .from('marketplace_listings')
    .select('*, seller:profiles!seller_id(id, username, avatar_url), post:posts!post_id(*, media:post_media(*))')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (query) {
    q = q.ilike('title', `%${query}%`);
  }
  const { data, error } = await q;
  return { data, error };
}

import { supabase } from '@/lib/supabase';

export async function createOrder(params: {
  buyerId: string;
  sellerId: string;
  listingId: string;
  orderType: 'digital_download' | 'print_on_demand';
  amountCents: number;
  printConfig?: Record<string, unknown>;
  shippingAddress?: Record<string, unknown>;
}) {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      buyer_id: params.buyerId,
      seller_id: params.sellerId,
      listing_id: params.listingId,
      order_type: params.orderType,
      amount_cents: params.amountCents,
      print_config: params.printConfig,
      shipping_address: params.shippingAddress,
      status: 'pending',
    })
    .select()
    .single();
  return { data, error };
}

export async function getOrder(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, listing:marketplace_listings(*, post:posts!post_id(*, media:post_media(*))), seller:profiles!seller_id(id, username, avatar_url), buyer:profiles!buyer_id(id, username, avatar_url)')
    .eq('id', orderId)
    .single();
  return { data, error };
}

export async function getMyOrders(buyerId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, listing:marketplace_listings(title, price_cents, post:posts!post_id(*, media:post_media(*))), seller:profiles!seller_id(id, username, avatar_url)')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getMySales(sellerId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, listing:marketplace_listings(title, price_cents), buyer:profiles!buyer_id(id, username, avatar_url)')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  return { data, error };
}

type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export async function updateOrderStatus(orderId: string, status: OrderStatus, extra?: { trackingNumber?: string; downloadUrl?: string }) {
  const { error } = await supabase
    .from('orders')
    .update({
      status,
      ...(extra?.trackingNumber && { tracking_number: extra.trackingNumber }),
      ...(extra?.downloadUrl && { download_url: extra.downloadUrl }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);
  return { error };
}

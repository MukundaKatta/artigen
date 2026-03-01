import { supabase } from '@/lib/supabase';

export async function getCreatorTiers(creatorId: string) {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('creator_id', creatorId)
    .eq('is_active', true)
    .order('sort_order');
  return { data, error };
}

export async function createTier(params: {
  creatorId: string;
  name: string;
  description?: string;
  priceCents: number;
  benefits?: string[];
  badgeLabel?: string;
  badgeColor?: string;
  maxSubscribers?: number;
}) {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .insert({
      creator_id: params.creatorId,
      name: params.name,
      description: params.description || '',
      price_cents: params.priceCents,
      benefits: params.benefits || [],
      badge_label: params.badgeLabel,
      badge_color: params.badgeColor || '#FFD700',
      max_subscribers: params.maxSubscribers,
    })
    .select()
    .single();
  return { data, error };
}

export async function updateTier(tierId: string, updates: {
  name?: string;
  description?: string;
  priceCents?: number;
  benefits?: string[];
  badgeLabel?: string;
  badgeColor?: string;
  isActive?: boolean;
  maxSubscribers?: number;
}) {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .update({
      ...(updates.name && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.priceCents !== undefined && { price_cents: updates.priceCents }),
      ...(updates.benefits && { benefits: updates.benefits }),
      ...(updates.badgeLabel !== undefined && { badge_label: updates.badgeLabel }),
      ...(updates.badgeColor && { badge_color: updates.badgeColor }),
      ...(updates.isActive !== undefined && { is_active: updates.isActive }),
      ...(updates.maxSubscribers !== undefined && { max_subscribers: updates.maxSubscribers }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', tierId)
    .select()
    .single();
  return { data, error };
}

export async function deleteTier(tierId: string) {
  const { error } = await supabase
    .from('subscription_tiers')
    .delete()
    .eq('id', tierId);
  return { error };
}

export async function subscribe(subscriberId: string, creatorId: string, tierId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      subscriber_id: subscriberId,
      creator_id: creatorId,
      tier_id: tierId,
      status: 'active',
    })
    .select()
    .single();
  return { data, error };
}

export async function cancelSubscription(subscriberId: string, creatorId: string) {
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('subscriber_id', subscriberId)
    .eq('creator_id', creatorId)
    .eq('status', 'active');
  return { error };
}

export async function getMySubscriptions(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, tier:subscription_tiers(*), creator:profiles!creator_id(id, username, avatar_url, full_name)')
    .eq('subscriber_id', userId)
    .eq('status', 'active');
  return { data, error };
}

export async function getMySubscribers(creatorId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, tier:subscription_tiers(*), subscriber:profiles!subscriber_id(id, username, avatar_url, full_name)')
    .eq('creator_id', creatorId)
    .eq('status', 'active');
  return { data, error };
}

export async function checkSubscription(subscriberId: string, creatorId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, tier:subscription_tiers(*)')
    .eq('subscriber_id', subscriberId)
    .eq('creator_id', creatorId)
    .eq('status', 'active')
    .maybeSingle();
  return { data, error };
}

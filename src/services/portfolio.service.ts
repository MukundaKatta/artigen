import { supabase } from '@/lib/supabase';

export type PortfolioSection = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  items?: PortfolioItem[];
};

export type PortfolioItem = {
  id: string;
  section_id: string;
  post_id: string;
  caption_override: string | null;
  sort_order: number;
  post?: any;
};

export async function getPortfolio(userId: string) {
  const { data: sections, error } = await supabase
    .from('portfolio_sections')
    .select('*, items:portfolio_items(*, post:posts(*, media:post_media(*)))')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) return { data: [] as PortfolioSection[], error };

  const sorted = (sections || []).map((s: any) => ({
    ...s,
    items: (s.items || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }));

  return { data: sorted as PortfolioSection[], error: null };
}

export async function createSection(userId: string, title: string, description?: string) {
  // Get max sort order
  const { data: existing } = await supabase
    .from('portfolio_sections')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from('portfolio_sections')
    .insert({
      user_id: userId,
      title,
      description: description || null,
      sort_order: nextOrder,
    })
    .select()
    .single();

  return { data: data as PortfolioSection | null, error };
}

export async function updateSection(sectionId: string, updates: { title?: string; description?: string }) {
  const { data, error } = await supabase
    .from('portfolio_sections')
    .update(updates)
    .eq('id', sectionId)
    .select()
    .single();

  return { data: data as PortfolioSection | null, error };
}

export async function deleteSection(sectionId: string) {
  const { error } = await supabase
    .from('portfolio_sections')
    .delete()
    .eq('id', sectionId);

  return { error };
}

export async function addItem(sectionId: string, postId: string, captionOverride?: string) {
  // Get max sort order for this section
  const { data: existing } = await supabase
    .from('portfolio_items')
    .select('sort_order')
    .eq('section_id', sectionId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from('portfolio_items')
    .insert({
      section_id: sectionId,
      post_id: postId,
      caption_override: captionOverride || null,
      sort_order: nextOrder,
    })
    .select('*, post:posts(*, media:post_media(*))')
    .single();

  return { data: data as PortfolioItem | null, error };
}

export async function removeItem(itemId: string) {
  const { error } = await supabase
    .from('portfolio_items')
    .delete()
    .eq('id', itemId);

  return { error };
}

export async function reorderSections(userId: string, sectionIds: string[]) {
  const updates = sectionIds.map((id, index) =>
    supabase
      .from('portfolio_sections')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('user_id', userId)
  );

  await Promise.all(updates);
  return { error: null };
}

export async function reorderItems(sectionId: string, itemIds: string[]) {
  const updates = itemIds.map((id, index) =>
    supabase
      .from('portfolio_items')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('section_id', sectionId)
  );

  await Promise.all(updates);
  return { error: null };
}

export async function enablePortfolio(userId: string, bio?: string, contactEmail?: string) {
  const { error } = await supabase
    .from('profiles')
    .update({
      portfolio_enabled: true,
      portfolio_bio: bio || null,
      portfolio_contact_email: contactEmail || null,
    })
    .eq('id', userId);

  return { error };
}

export async function disablePortfolio(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ portfolio_enabled: false })
    .eq('id', userId);

  return { error };
}

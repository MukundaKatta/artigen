import { supabase } from '@/lib/supabase';

export type StoryHighlight = {
  id: string;
  user_id: string;
  title: string;
  cover_url: string | null;
  sort_order: number;
  created_at: string;
};

export type HighlightWithStories = StoryHighlight & {
  items: { story_id: string; media_url: string; media_type: string }[];
};

export async function getHighlights(userId: string) {
  const { data, error } = await supabase
    .from('story_highlights')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error || !data) return { data: [] as HighlightWithStories[], error };

  // Fetch items for each highlight
  type HighlightIdRow = { id: string };
  const highlightIds = (data as unknown as HighlightIdRow[]).map((h) => h.id);
  const { data: items } = await supabase
    .from('story_highlight_items')
    .select('highlight_id, story_id, stories!story_id(media_url, media_type)')
    .in('highlight_id', highlightIds)
    .order('sort_order', { ascending: true });

  type HighlightItemRow = {
    highlight_id: string;
    story_id: string;
    stories: { media_url: string; media_type: string } | null;
  };
  type HighlightItem = HighlightWithStories['items'][number];

  const itemsMap = new Map<string, HighlightItem[]>();
  ((items ?? []) as unknown as HighlightItemRow[]).forEach((item) => {
    const list = itemsMap.get(item.highlight_id) ?? [];
    list.push({
      story_id: item.story_id,
      media_url: item.stories?.media_url ?? '',
      media_type: item.stories?.media_type ?? '',
    });
    itemsMap.set(item.highlight_id, list);
  });

  const highlights: HighlightWithStories[] = (data as unknown as StoryHighlight[]).map((h) => ({
    ...h,
    items: itemsMap.get(h.id) || [],
  }));

  return { data: highlights, error: null };
}

export async function createHighlight(userId: string, title: string, storyIds: string[], coverUrl?: string) {
  const { data: highlight, error } = await supabase
    .from('story_highlights')
    .insert({ user_id: userId, title, cover_url: coverUrl || null })
    .select()
    .single();

  if (error || !highlight) return { data: null, error };

  const items = storyIds.map((storyId, i) => ({
    highlight_id: (highlight as StoryHighlight).id,
    story_id: storyId,
    sort_order: i,
  }));

  await supabase.from('story_highlight_items').insert(items);

  return { data: highlight as unknown as StoryHighlight, error: null };
}

export async function deleteHighlight(highlightId: string) {
  const { error } = await supabase
    .from('story_highlights')
    .delete()
    .eq('id', highlightId);
  return { error };
}

export async function addStoryToHighlight(highlightId: string, storyId: string) {
  const { error } = await supabase
    .from('story_highlight_items')
    .insert({ highlight_id: highlightId, story_id: storyId });
  return { error };
}

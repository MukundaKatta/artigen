import { supabase } from '@/lib/supabase';
import type { AwardType, PostAward } from '@/types';

// ── Award Types ──────────────────────────────────────

export async function getAwardTypes() {
  const { data, error } = await supabase
    .from('award_types')
    .select('*')
    .order('sort_order', { ascending: true });

  return { data: (data || []) as unknown as AwardType[], error };
}

// ── Give Award ───────────────────────────────────────

export async function giveAward(postId: string, userId: string, awardTypeId: string) {
  const { data, error } = await supabase
    .from('post_awards')
    .insert({ post_id: postId, user_id: userId, award_type_id: awardTypeId })
    .select()
    .single();

  return { data: data as unknown as PostAward | null, error };
}

// ── Get Post Awards ──────────────────────────────────

export type AwardSummaryItem = {
  award_type_id: string;
  emoji: string;
  name: string;
  count: number;
};

export async function getPostAwards(postId: string): Promise<{ data: AwardSummaryItem[] }> {
  const { data } = await supabase
    .from('post_awards')
    .select('award_type_id, award_type:award_types!award_type_id(emoji, name)')
    .eq('post_id', postId);

  const raw = (data || []) as unknown as {
    award_type_id: string;
    award_type: { emoji: string; name: string };
  }[];

  // Group by award type
  const map = new Map<string, AwardSummaryItem>();
  raw.forEach((r) => {
    const existing = map.get(r.award_type_id);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(r.award_type_id, {
        award_type_id: r.award_type_id,
        emoji: r.award_type?.emoji || '',
        name: r.award_type?.name || '',
        count: 1,
      });
    }
  });

  return { data: Array.from(map.values()) };
}

// ── Batch Get for Feed ───────────────────────────────

export async function getPostAwardsSummary(
  postIds: string[]
): Promise<Map<string, AwardSummaryItem[]>> {
  const result = new Map<string, AwardSummaryItem[]>();
  if (postIds.length === 0) return result;

  const { data } = await supabase
    .from('post_awards')
    .select('post_id, award_type_id, award_type:award_types!award_type_id(emoji, name)')
    .in('post_id', postIds);

  const raw = (data || []) as unknown as {
    post_id: string;
    award_type_id: string;
    award_type: { emoji: string; name: string };
  }[];

  // Group by post_id, then by award_type_id
  raw.forEach((r) => {
    if (!result.has(r.post_id)) {
      result.set(r.post_id, []);
    }
    const postAwards = result.get(r.post_id)!;
    const existing = postAwards.find((a) => a.award_type_id === r.award_type_id);
    if (existing) {
      existing.count += 1;
    } else {
      postAwards.push({
        award_type_id: r.award_type_id,
        emoji: r.award_type?.emoji || '',
        name: r.award_type?.name || '',
        count: 1,
      });
    }
  });

  return result;
}

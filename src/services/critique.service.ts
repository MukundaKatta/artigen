import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 20;

// ── Types ────────────────────────────────────────────

export type CritiqueRatings = {
  composition_rating: number;
  color_rating: number;
  technique_rating: number;
  prompt_craft_rating: number;
  originality_rating: number;
  overall_rating: number;
};

export type Critique = {
  id: string;
  post_id: string;
  user_id: string;
  composition_rating: number;
  color_rating: number;
  technique_rating: number;
  prompt_craft_rating: number;
  originality_rating: number;
  overall_rating: number;
  feedback_text: string;
  helpful_count: number;
  created_at: string;
  user: { id: string; username: string; avatar_url: string | null };
};

export type CritiqueSummary = {
  totalCritiques: number;
  avgComposition: number;
  avgColor: number;
  avgTechnique: number;
  avgPromptCraft: number;
  avgOriginality: number;
  avgOverall: number;
};

// ── Submit a critique ────────────────────────────────

export async function submitCritique(
  postId: string,
  userId: string,
  ratings: CritiqueRatings,
  feedbackText: string,
) {
  const { data, error } = await supabase
    .from('post_critiques')
    .insert({
      post_id: postId,
      user_id: userId,
      ...ratings,
      feedback_text: feedbackText,
    })
    .select('*, user:profiles!user_id(id, username, avatar_url)')
    .single();

  return { data: data as unknown as Critique | null, error };
}

// ── Get critiques for a post (paginated) ─────────────

export async function getCritiques(postId: string, page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('post_critiques')
    .select('*, user:profiles!user_id(id, username, avatar_url)')
    .eq('post_id', postId)
    .order('helpful_count', { ascending: false })
    .range(from, to);

  return { data: (data || []) as unknown as Critique[], error };
}

// ── Get average ratings summary for a post ───────────

export async function getPostCritiqueSummary(postId: string): Promise<{ data: CritiqueSummary | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('post_critiques')
    .select('composition_rating, color_rating, technique_rating, prompt_craft_rating, originality_rating, overall_rating')
    .eq('post_id', postId);

  if (error || !data || data.length === 0) {
    return {
      data: {
        totalCritiques: 0,
        avgComposition: 0,
        avgColor: 0,
        avgTechnique: 0,
        avgPromptCraft: 0,
        avgOriginality: 0,
        avgOverall: 0,
      },
      error,
    };
  }

  const count = data.length;
  const avg = (field: keyof typeof data[0]) =>
    data.reduce((sum, c) => sum + ((c[field] as number) || 0), 0) / count;

  return {
    data: {
      totalCritiques: count,
      avgComposition: avg('composition_rating'),
      avgColor: avg('color_rating'),
      avgTechnique: avg('technique_rating'),
      avgPromptCraft: avg('prompt_craft_rating'),
      avgOriginality: avg('originality_rating'),
      avgOverall: avg('overall_rating'),
    },
    error: null,
  };
}

// ── Mark a critique as helpful ───────────────────────

export async function markHelpful(critiqueId: string, userId: string) {
  const { error } = await supabase
    .from('critique_helpful_votes')
    .insert({ critique_id: critiqueId, user_id: userId });

  if (error) return { error };

  // Increment helpful_count
  const { data: critique } = await supabase
    .from('post_critiques')
    .select('helpful_count')
    .eq('id', critiqueId)
    .single();

  if (critique) {
    await supabase
      .from('post_critiques')
      .update({ helpful_count: (critique.helpful_count || 0) + 1 } as any)
      .eq('id', critiqueId);
  }

  return { error: null };
}

// ── Unmark a critique as helpful ─────────────────────

export async function unmarkHelpful(critiqueId: string, userId: string) {
  const { error } = await supabase
    .from('critique_helpful_votes')
    .delete()
    .eq('critique_id', critiqueId)
    .eq('user_id', userId);

  if (error) return { error };

  // Decrement helpful_count
  const { data: critique } = await supabase
    .from('post_critiques')
    .select('helpful_count')
    .eq('id', critiqueId)
    .single();

  if (critique) {
    await supabase
      .from('post_critiques')
      .update({ helpful_count: Math.max(0, (critique.helpful_count || 0) - 1) } as any)
      .eq('id', critiqueId);
  }

  return { error: null };
}

// ── Get the current user's critique for a post ───────

export async function getUserCritiqueForPost(postId: string, userId: string) {
  const { data, error } = await supabase
    .from('post_critiques')
    .select('*, user:profiles!user_id(id, username, avatar_url)')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  return { data: data as unknown as Critique | null, error };
}

// ── Get top critics (users with the most critiques) ──

export async function getTopCritics(limit = 10) {
  const { data, error } = await supabase
    .from('post_critiques')
    .select('user_id, user:profiles!user_id(id, username, avatar_url)')
    .order('created_at', { ascending: false });

  if (error || !data) return { data: [], error };

  type CriticUser = { id: string; username: string; avatar_url: string | null };
  type CritiqueRow = { user_id: string; user: CriticUser };

  // Aggregate by user
  const countMap = new Map<string, { user: CriticUser; count: number }>();
  for (const row of data as unknown as CritiqueRow[]) {
    const existing = countMap.get(row.user_id);
    if (existing) {
      existing.count++;
    } else {
      countMap.set(row.user_id, { user: row.user, count: 1 });
    }
  }

  const sorted = Array.from(countMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return { data: sorted, error: null };
}

// ── Batch check which critiques the user voted helpful ─

export async function getUserHelpfulVoteIds(critiqueIds: string[], userId: string): Promise<Set<string>> {
  if (critiqueIds.length === 0) return new Set();

  const { data } = await supabase
    .from('critique_helpful_votes')
    .select('critique_id')
    .in('critique_id', critiqueIds)
    .eq('user_id', userId);

  return new Set((data ?? []).map((v) => v.critique_id as string));
}

// ── Get critique count for a post ────────────────────

export async function getCritiqueCount(postId: string): Promise<number> {
  const { count, error } = await supabase
    .from('post_critiques')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);

  return error ? 0 : (count ?? 0);
}

import { supabase } from '@/lib/supabase';

// ── Types ────────────────────────────────────────────

export type UserXp = {
  id: string;
  user_id: string;
  total_xp: number;
  level: number;
  xp_to_next_level: number;
  updated_at: string;
};

export type XpTransaction = {
  id: string;
  user_id: string;
  amount: number;
  source: 'tutorial' | 'lesson' | 'challenge' | 'battle' | 'daily_post' | 'streak' | 'badge';
  source_id: string | null;
  created_at: string;
};

// ── Level thresholds ─────────────────────────────────

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000];

export function calculateLevel(totalXp: number): { level: number; xpToNextLevel: number } {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const nextThreshold =
    level < LEVEL_THRESHOLDS.length
      ? LEVEL_THRESHOLDS[level]
      : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (level - LEVEL_THRESHOLDS.length + 1) * 4000;

  return { level, xpToNextLevel: nextThreshold - totalXp };
}

// ── Get user XP ──────────────────────────────────────

export async function getUserXp(userId: string) {
  const { data, error } = await supabase
    .from('user_xp')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return { data: data as unknown as UserXp | null, error };
}

// ── Award XP ─────────────────────────────────────────

export async function awardXp(
  userId: string,
  amount: number,
  source: XpTransaction['source'],
  sourceId?: string,
) {
  // Insert transaction
  const { error: txError } = await supabase
    .from('xp_transactions')
    .insert({
      user_id: userId,
      amount,
      source,
      source_id: sourceId || null,
    });

  if (txError) return { error: txError };

  // Get or create user XP record
  const { data: existing } = await getUserXp(userId);

  if (existing) {
    const newTotal = existing.total_xp + amount;
    const { level, xpToNextLevel } = calculateLevel(newTotal);

    const { data, error } = await supabase
      .from('user_xp')
      .update({
        total_xp: newTotal,
        level,
        xp_to_next_level: xpToNextLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    return { data: data as unknown as UserXp | null, error };
  } else {
    const { level, xpToNextLevel } = calculateLevel(amount);

    const { data, error } = await supabase
      .from('user_xp')
      .insert({
        user_id: userId,
        total_xp: amount,
        level,
        xp_to_next_level: xpToNextLevel,
      })
      .select()
      .single();

    return { data: data as unknown as UserXp | null, error };
  }
}

// ── Get XP history ───────────────────────────────────

export async function getXpHistory(userId: string, page = 0, pageSize = 20) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('xp_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: (data || []) as unknown as XpTransaction[], error };
}

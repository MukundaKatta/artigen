import { supabase } from '@/lib/supabase';
import type { UserStreak } from '@/types';

// ── Get Streak ───────────────────────────────────────────────────

export async function getStreak(userId: string) {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return { data: data as UserStreak | null, error };
}

// ── Update Streak ────────────────────────────────────────────────
// Called after creating a post. Logic:
// - If last_post_date is today → do nothing
// - If last_post_date is yesterday → increment current_streak
// - If last_post_date is older → reset current_streak to 1
// - Update longest_streak if current > longest
// - Upsert the row

export async function updateStreak(userId: string) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

  const { data: existing } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  const streak = existing as UserStreak | null;

  if (streak && streak.last_post_date === todayStr) {
    // Already posted today — do nothing
    return { data: streak, error: null };
  }

  let currentStreak = 1;

  if (streak?.last_post_date) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (streak.last_post_date === yesterdayStr) {
      // Last post was yesterday — increment streak
      currentStreak = (streak.current_streak || 0) + 1;
    }
    // Otherwise reset to 1 (already set above)
  }

  const longestStreak = Math.max(currentStreak, streak?.longest_streak || 0);

  const { data, error } = await supabase
    .from('user_streaks')
    .upsert(
      {
        user_id: userId,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_post_date: todayStr,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select('*')
    .single();

  return { data: data as UserStreak | null, error };
}

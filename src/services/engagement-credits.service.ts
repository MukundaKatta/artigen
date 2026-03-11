import { supabase } from '@/lib/supabase';

// ── Action types ─────────────────────────────────────

export type EngagementCreditAction =
  | 'vote_on_challenge'
  | 'daily_login'
  | 'first_post_of_day'
  | 'receive_like'
  | 'give_constructive_critique'
  | 'win_challenge'
  | 'streak_bonus_7_day'
  | 'streak_bonus_30_day'
  | 'refer_user';

// ── Credit amounts per action ────────────────────────

export const ENGAGEMENT_CREDITS: Record<EngagementCreditAction, number> = {
  vote_on_challenge: 1,
  daily_login: 2,
  first_post_of_day: 3,
  receive_like: 0.5,
  give_constructive_critique: 5,
  win_challenge: 25,
  streak_bonus_7_day: 10,
  streak_bonus_30_day: 50,
  refer_user: 20,
};

/** Max credits a user can earn per day through engagement. */
const DAILY_CREDIT_CAP = 50;

/** Max "receive_like" rewards per day. */
const RECEIVE_LIKE_DAILY_CAP = 10;

// ── Human-readable labels ────────────────────────────

export const ACTION_LABELS: Record<EngagementCreditAction, string> = {
  vote_on_challenge: 'Challenge Vote',
  daily_login: 'Daily Login',
  first_post_of_day: 'First Post of the Day',
  receive_like: 'Received a Like',
  give_constructive_critique: 'Constructive Critique',
  win_challenge: 'Challenge Win',
  streak_bonus_7_day: '7-Day Streak Bonus',
  streak_bonus_30_day: '30-Day Streak Bonus',
  refer_user: 'Referral Bonus',
};

// ── Result types ─────────────────────────────────────

export type AwardResult = {
  credits_awarded: number;
  new_balance: number;
  action: EngagementCreditAction;
};

export type EngagementSummary = {
  today_earned: number;
  daily_cap: number;
  remaining: number;
  streak_days: number;
  actions_today: { action: string; credits: number; count: number }[];
};

// ── Helpers ──────────────────────────────────────────

function todayStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function todayEnd(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

// ── Award engagement credits ─────────────────────────

export async function awardEngagementCredits(
  userId: string,
  action: EngagementCreditAction,
  metadata?: Record<string, unknown>,
): Promise<{ data: AwardResult | null; error: string | null }> {
  const creditsForAction = ENGAGEMENT_CREDITS[action];

  // 1. Check daily cap
  const { remaining, error: capError } = await getDailyCreditCap(userId);
  if (capError) return { data: null, error: capError };
  if (remaining <= 0) return { data: null, error: 'daily_cap_reached' };

  // 2. Deduplicate — prevent double-claiming the same action today
  const isDuplicate = await checkDuplicate(userId, action, metadata);
  if (isDuplicate) return { data: null, error: 'already_claimed' };

  // 3. For receive_like, enforce per-action daily cap
  if (action === 'receive_like') {
    const likeCount = await getTodayActionCount(userId, 'receive_like');
    if (likeCount >= RECEIVE_LIKE_DAILY_CAP) return { data: null, error: 'action_daily_limit' };
  }

  // 4. Clamp to remaining daily cap
  const actualCredits = Math.min(creditsForAction, remaining);

  // 5. Record the engagement credit event
  const { error: insertError } = await (supabase
    .from('engagement_credits' as any)
    .insert({
      user_id: userId,
      action,
      credits: actualCredits,
      metadata: metadata ?? null,
    }) as any);

  if (insertError) return { data: null, error: insertError.message };

  // 6. Add credits to wallet via RPC
  const { error: walletError } = await supabase.rpc('add_wallet_credits' as any, {
    p_user_id: userId,
    p_amount: actualCredits,
    p_description: `Engagement: ${ACTION_LABELS[action]}`,
  } as any);

  if (walletError) return { data: null, error: walletError.message };

  // 7. Fetch updated balance
  const { data: updatedWallet } = await supabase
    .from('wallets')
    .select('balance_cents')
    .eq('user_id', userId)
    .maybeSingle();

  return {
    data: {
      credits_awarded: actualCredits,
      new_balance: updatedWallet?.balance_cents ?? 0,
      action,
    },
    error: null,
  };
}

// ── Get engagement summary for today ─────────────────

export async function getEngagementSummary(
  userId: string,
): Promise<{ data: EngagementSummary | null; error: string | null }> {
  const start = todayStart();
  const end = todayEnd();

  // Today's engagement credit records
  const { data: records, error } = await (supabase
    .from('engagement_credits' as any)
    .select('action, credits')
    .eq('user_id', userId)
    .gte('created_at', start)
    .lte('created_at', end) as any);

  if (error) return { data: null, error: error.message };

  const rows = (records ?? []) as Array<{ action: string; credits: number }>;
  const todayEarned = rows.reduce((sum, r) => sum + (r.credits ?? 0), 0);

  // Group by action
  const grouped = new Map<string, { credits: number; count: number }>();
  for (const row of rows) {
    const prev = grouped.get(row.action) ?? { credits: 0, count: 0 };
    grouped.set(row.action, {
      credits: prev.credits + (row.credits ?? 0),
      count: prev.count + 1,
    });
  }

  const actionsSummary = Array.from(grouped.entries()).map(([action, v]) => ({
    action,
    credits: v.credits,
    count: v.count,
  }));

  // Streak info (reuse existing table if available)
  let streakDays = 0;
  const { data: streak } = await (supabase
    .from('login_streaks' as any)
    .select('current_streak')
    .eq('user_id', userId)
    .maybeSingle() as any);

  if (streak) streakDays = (streak as any).current_streak ?? 0;

  return {
    data: {
      today_earned: todayEarned,
      daily_cap: DAILY_CREDIT_CAP,
      remaining: Math.max(0, DAILY_CREDIT_CAP - todayEarned),
      streak_days: streakDays,
      actions_today: actionsSummary,
    },
    error: null,
  };
}

// ── Get remaining daily cap ──────────────────────────

export async function getDailyCreditCap(
  userId: string,
): Promise<{ remaining: number; error: string | null }> {
  const start = todayStart();
  const end = todayEnd();

  const { data, error } = await (supabase
    .from('engagement_credits' as any)
    .select('credits')
    .eq('user_id', userId)
    .gte('created_at', start)
    .lte('created_at', end) as any);

  if (error) return { remaining: 0, error: error.message };

  const earned = ((data ?? []) as Array<{ credits: number }>).reduce((sum, r) => sum + (r.credits ?? 0), 0);
  return { remaining: Math.max(0, DAILY_CREDIT_CAP - earned), error: null };
}

// ── Internal: check duplicate claims ─────────────────

async function checkDuplicate(
  userId: string,
  action: EngagementCreditAction,
  metadata?: Record<string, unknown>,
): Promise<boolean> {
  const start = todayStart();
  const end = todayEnd();

  // Actions that should only fire once per day
  const oncePerDay: EngagementCreditAction[] = [
    'daily_login',
    'first_post_of_day',
    'streak_bonus_7_day',
    'streak_bonus_30_day',
  ];

  if (oncePerDay.includes(action)) {
    const { data } = await (supabase
      .from('engagement_credits' as any)
      .select('id')
      .eq('user_id', userId)
      .eq('action', action)
      .gte('created_at', start)
      .lte('created_at', end)
      .limit(1) as any);

    return ((data as any[])?.length ?? 0) > 0;
  }

  // For reference-based actions (vote, like, critique, refer), dedupe by metadata
  if (metadata?.reference_id) {
    const { data } = await (supabase
      .from('engagement_credits' as any)
      .select('id')
      .eq('user_id', userId)
      .eq('action', action)
      .contains('metadata', { reference_id: metadata.reference_id })
      .limit(1) as any);

    return ((data as any[])?.length ?? 0) > 0;
  }

  return false;
}

// ── Internal: count today's occurrences of an action ─

async function getTodayActionCount(
  userId: string,
  action: EngagementCreditAction,
): Promise<number> {
  const start = todayStart();
  const end = todayEnd();

  const { data } = await (supabase
    .from('engagement_credits' as any)
    .select('id')
    .eq('user_id', userId)
    .eq('action', action)
    .gte('created_at', start)
    .lte('created_at', end) as any);

  return (data as any[])?.length ?? 0;
}

// ── Info array for UI display ────────────────────────

export const ENGAGEMENT_CREDITS_INFO = [
  { action: 'vote_on_challenge' as const, label: 'Vote on Challenge', credits: 1, description: 'Vote on a challenge entry' },
  { action: 'daily_login' as const, label: 'Daily Login', credits: 2, description: 'Log in each day' },
  { action: 'first_post_of_day' as const, label: 'First Post', credits: 3, description: 'Create your first post of the day' },
  { action: 'receive_like' as const, label: 'Receive Like', credits: 0.5, description: 'Someone likes your post (max 10/day)' },
  { action: 'give_constructive_critique' as const, label: 'Give Critique', credits: 5, description: 'Write a constructive critique' },
  { action: 'win_challenge' as const, label: 'Win Challenge', credits: 25, description: 'Win a daily challenge' },
  { action: 'streak_bonus_7_day' as const, label: '7-Day Streak', credits: 10, description: 'Maintain a 7-day login streak' },
  { action: 'streak_bonus_30_day' as const, label: '30-Day Streak', credits: 50, description: 'Maintain a 30-day login streak' },
  { action: 'refer_user' as const, label: 'Refer a Friend', credits: 20, description: 'Invite a friend who signs up' },
] as const;

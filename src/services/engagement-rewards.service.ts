import { supabase } from '@/lib/supabase';

export type EngagementAction = 'daily_login' | 'post_created' | 'like_received';

export type RewardResult = {
  credits_earned: number;
  action: string;
  streak?: number;
  error?: string;
};

export type EngagementReward = {
  id: string;
  action: string;
  credits_earned: number;
  reference_id: string | null;
  created_at: string;
};

export async function claimEngagementReward(
  action: EngagementAction,
  referenceId?: string,
): Promise<{ data: RewardResult | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('claim-engagement-reward', {
    body: { action, reference_id: referenceId },
  });

  if (error) return { data: null, error: error.message };
  if (data?.error && data.error !== 'daily_limit_reached' && data.error !== 'already_claimed' && data.error !== 'already_rewarded') {
    return { data: null, error: data.error };
  }
  return { data: data as RewardResult, error: null };
}

export async function claimDailyLogin(): Promise<RewardResult | null> {
  const { data } = await claimEngagementReward('daily_login');
  return data;
}

export async function getRewardHistory(
  userId: string,
  limit = 50,
): Promise<EngagementReward[]> {
  const { data } = await (supabase.from('engagement_rewards') as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getLoginStreak(userId: string): Promise<{ current_streak: number; longest_streak: number } | null> {
  const { data } = await (supabase.from('login_streaks') as any)
    .select('current_streak, longest_streak')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

export const ENGAGEMENT_REWARDS_INFO = [
  { action: 'daily_login', label: 'Daily Login', credits: 10, description: 'Log in each day (+2/streak day bonus)' },
  { action: 'post_created', label: 'Create Post', credits: 5, description: 'Share your art with the community' },
  { action: 'like_received', label: 'Receive Like', credits: 1, description: 'Earn when others appreciate your art' },
] as const;

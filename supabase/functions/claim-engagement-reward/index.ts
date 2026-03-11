import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  corsHeaders,
  jsonResponse,
  requireAuth,
  createServiceClient,
  checkRateLimit,
  rateLimitResponse,
} from '../_shared/auth.ts';

const REWARD_CONFIG: Record<string, { credits: number; dailyLimit: number }> = {
  daily_login: { credits: 10, dailyLimit: 1 },
  post_created: { credits: 5, dailyLimit: 10 },
  like_received: { credits: 1, dailyLimit: 50 },
  streak_bonus: { credits: 0, dailyLimit: 1 }, // calculated dynamically
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;

  if (!checkRateLimit(authResult.userId, 'engagement-reward', 30, 60)) {
    return rateLimitResponse();
  }

  try {
    const { action, reference_id } = await req.json();

    if (!action || !REWARD_CONFIG[action]) {
      return jsonResponse({ error: 'Invalid action' }, 400);
    }

    const supabase = createServiceClient();
    const userId = authResult.userId;
    const config = REWARD_CONFIG[action];

    // Check daily limit
    const today = new Date().toISOString().split('T')[0];
    const { count } = await (supabase.from('engagement_rewards') as any)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action', action)
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`);

    if ((count ?? 0) >= config.dailyLimit) {
      return jsonResponse({ error: 'daily_limit_reached', credits_earned: 0 }, 200);
    }

    let creditsToEarn = config.credits;

    // Handle daily login + streak
    if (action === 'daily_login') {
      const { data: streak } = await (supabase.from('login_streaks') as any)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      let longestStreak = streak?.longest_streak ?? 0;

      if (streak?.last_login_date === today) {
        return jsonResponse({ error: 'already_claimed', credits_earned: 0, streak: streak.current_streak }, 200);
      }

      if (streak?.last_login_date === yesterdayStr) {
        newStreak = (streak.current_streak ?? 0) + 1;
      }

      if (newStreak > longestStreak) longestStreak = newStreak;

      // Streak bonus: +2 credits per streak day (capped at +20)
      const streakBonus = Math.min(newStreak * 2, 20);
      creditsToEarn += streakBonus;

      await (supabase.from('login_streaks') as any).upsert({
        user_id: userId,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_login_date: today,
        updated_at: new Date().toISOString(),
      });

      // Record streak bonus separately if > 0
      if (streakBonus > 0) {
        await (supabase.from('engagement_rewards') as any).insert({
          user_id: userId,
          action: 'streak_bonus',
          credits_earned: streakBonus,
          reference_id: `streak_${newStreak}`,
        });
      }
    }

    // Prevent duplicate reward for same reference
    if (reference_id) {
      const { data: existing } = await (supabase.from('engagement_rewards') as any)
        .select('id')
        .eq('user_id', userId)
        .eq('action', action)
        .eq('reference_id', reference_id)
        .maybeSingle();

      if (existing) {
        return jsonResponse({ error: 'already_rewarded', credits_earned: 0 }, 200);
      }
    }

    // Record the reward
    await (supabase.from('engagement_rewards') as any).insert({
      user_id: userId,
      action,
      credits_earned: action === 'daily_login' ? config.credits : creditsToEarn,
      reference_id,
    });

    // Credit the user's wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('id, balance_cents')
      .eq('user_id', userId)
      .maybeSingle();

    if (wallet) {
      await supabase
        .from('wallets')
        .update({ balance_cents: wallet.balance_cents + creditsToEarn })
        .eq('id', wallet.id);
    } else {
      await supabase.from('wallets').insert({
        user_id: userId,
        balance_cents: creditsToEarn,
      });
    }

    return jsonResponse({
      credits_earned: creditsToEarn,
      action,
      ...(action === 'daily_login' ? { streak: (await (supabase.from('login_streaks') as any).select('current_streak').eq('user_id', userId).single()).data?.current_streak ?? 1 } : {}),
    });
  } catch (err: any) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});

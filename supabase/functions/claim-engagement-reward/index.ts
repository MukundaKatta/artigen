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

    if (!action || typeof action !== 'string' || !REWARD_CONFIG[action]) {
      return jsonResponse({ error: 'Invalid action' }, 400);
    }

    const supabase = createServiceClient();
    const userId = authResult.userId;
    const config = REWARD_CONFIG[action];

    let creditsToEarn = config.credits;
    let streakInfo: { current_streak: number } | null = null;

    // Handle daily login + streak
    if (action === 'daily_login') {
      const today = new Date().toISOString().split('T')[0];
      const { data: streak } = await (supabase.from('login_streaks') as any)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (streak?.last_login_date === today) {
        return jsonResponse({ error: 'already_claimed', credits_earned: 0, streak: streak.current_streak }, 200);
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      let longestStreak = streak?.longest_streak ?? 0;

      if (streak?.last_login_date === yesterdayStr) {
        newStreak = (streak.current_streak ?? 0) + 1;
      }

      if (newStreak > longestStreak) longestStreak = newStreak;

      // Streak bonus: +2 credits per streak day (capped at +20)
      const streakBonus = Math.min(newStreak * 2, 20);
      creditsToEarn += streakBonus;

      // Upsert streak (atomic — last_login_date acts as natural dedup)
      await (supabase.from('login_streaks') as any).upsert({
        user_id: userId,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_login_date: today,
        updated_at: new Date().toISOString(),
      });

      streakInfo = { current_streak: newStreak };
    }

    // Use atomic insert with conflict handling for deduplication
    // For reference-based rewards, the unique index on (user_id, action, reference_id) prevents duplicates
    // For daily rewards, the unique partial index on (user_id, action, date) prevents duplicates
    const insertPayload: Record<string, unknown> = {
      user_id: userId,
      action,
      credits_earned: action === 'daily_login' ? config.credits : creditsToEarn,
      reference_id: reference_id || null,
    };

    const { error: insertError } = await (supabase.from('engagement_rewards') as any)
      .insert(insertPayload);

    if (insertError) {
      // Unique violation = duplicate claim attempt
      if (insertError.code === '23505') {
        return jsonResponse({ error: 'already_rewarded', credits_earned: 0 }, 200);
      }
      throw insertError;
    }

    // Record streak bonus separately if > 0 and daily_login
    if (action === 'daily_login') {
      const streakBonus = creditsToEarn - config.credits;
      if (streakBonus > 0) {
        await (supabase.from('engagement_rewards') as any).insert({
          user_id: userId,
          action: 'streak_bonus',
          credits_earned: streakBonus,
          reference_id: `streak_${streakInfo?.current_streak ?? 1}`,
        });
      }
    }

    // Credit the user's wallet atomically using RPC (prevents read-then-update race)
    const { error: walletError } = await supabase.rpc('add_wallet_credits' as any, {
      p_user_id: userId,
      p_amount: creditsToEarn,
      p_description: `Engagement: ${action}`,
    } as any);

    // Fallback: create wallet if RPC fails because wallet doesn't exist
    if (walletError) {
      await supabase.from('wallets').upsert({
        user_id: userId,
        balance_cents: creditsToEarn,
      }, { onConflict: 'user_id' });
    }

    return jsonResponse({
      credits_earned: creditsToEarn,
      action,
      ...(streakInfo ? { streak: streakInfo.current_streak } : {}),
    });
  } catch (err: any) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});

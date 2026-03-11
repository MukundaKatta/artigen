import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';
import {
  awardEngagementCredits,
  getEngagementSummary,
  type EngagementCreditAction,
  type AwardResult,
  type EngagementSummary,
  ENGAGEMENT_CREDITS,
  ACTION_LABELS,
} from '@/services/engagement-credits.service';

export type CreditToastData = {
  amount: number;
  action: EngagementCreditAction;
  label: string;
};

type UseEngagementCreditsReturn = {
  /** Credits earned today */
  todayEarned: number;
  /** Daily cap (50) */
  dailyCap: number;
  /** Remaining credits available to earn today */
  remaining: number;
  /** Current login streak */
  streakDays: number;
  /** Whether summary is loading */
  loading: boolean;
  /** Award credits for an action; returns the result or null on skip/error */
  awardCredits: (
    action: EngagementCreditAction,
    metadata?: Record<string, unknown>,
  ) => Promise<AwardResult | null>;
  /** Latest toast data — consumed by EngagementRewardToast */
  toast: CreditToastData | null;
  /** Dismiss the current toast */
  dismissToast: () => void;
  /** Refresh summary from server */
  refresh: () => Promise<void>;
};

export function useEngagementCredits(userId: string | undefined): UseEngagementCreditsReturn {
  const [summary, setSummary] = useState<EngagementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<CreditToastData | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  // ── Fetch summary on mount / userId change ─────────

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await getEngagementSummary(userId);
    if (data) setSummary(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh().catch((err) => logger.warn('Failed to load engagement summary:', err));
  }, [refresh]);

  // ── Award credits ─────────────────────────────────

  const awardCredits = useCallback(
    async (
      action: EngagementCreditAction,
      metadata?: Record<string, unknown>,
    ): Promise<AwardResult | null> => {
      if (!userId) return null;

      const { data, error } = await awardEngagementCredits(userId, action, metadata);

      if (error) {
        // Silently ignore expected dedup / cap errors
        if (
          error === 'daily_cap_reached' ||
          error === 'already_claimed' ||
          error === 'action_daily_limit'
        ) {
          return null;
        }
        logger.warn('Engagement credit error:', error);
        return null;
      }

      if (data && data.credits_awarded > 0) {
        // Show toast
        showToast(data.credits_awarded, action);

        // Update local summary optimistically
        setSummary((prev) =>
          prev
            ? {
                ...prev,
                today_earned: prev.today_earned + data.credits_awarded,
                remaining: Math.max(0, prev.remaining - data.credits_awarded),
              }
            : prev,
        );
      }

      return data;
    },
    [userId],
  );

  // ── Toast management ──────────────────────────────

  const showToast = useCallback((amount: number, action: EngagementCreditAction) => {
    // Clear any existing timer
    if (toastTimer.current) clearTimeout(toastTimer.current);

    setToast({ amount, action, label: ACTION_LABELS[action] });

    // Auto-dismiss is handled by the toast component, but we clear state
    // after a generous window so stale data doesn't linger.
    toastTimer.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  return {
    todayEarned: summary?.today_earned ?? 0,
    dailyCap: summary?.daily_cap ?? 50,
    remaining: summary?.remaining ?? 50,
    streakDays: summary?.streak_days ?? 0,
    loading,
    awardCredits,
    toast,
    dismissToast,
    refresh,
  };
}

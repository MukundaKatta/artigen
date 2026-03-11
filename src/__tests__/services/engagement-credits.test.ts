import { supabase } from '@/lib/supabase';
import {
  awardEngagementCredits,
  getEngagementSummary,
  getDailyCreditCap,
  ENGAGEMENT_CREDITS,
  ENGAGEMENT_CREDITS_INFO,
  ACTION_LABELS,
  type EngagementCreditAction,
} from '@/services/engagement-credits.service';

// supabase is auto-mocked via moduleNameMapper

// Helper: build a chainable query builder that resolves to the given value
function mockQueryChain(resolvedValue: any) {
  const chain: Record<string, jest.Mock> = {};
  const methods = [
    'select', 'insert', 'update', 'delete',
    'eq', 'neq', 'in', 'is', 'order', 'range', 'limit', 'filter',
    'gte', 'lte', 'gt', 'lt', 'contains', 'upsert',
  ];
  for (const m of methods) {
    chain[m] = jest.fn().mockReturnValue(chain);
  }
  chain.single = jest.fn().mockResolvedValue(resolvedValue);
  chain.maybeSingle = jest.fn().mockResolvedValue(resolvedValue);
  chain.then = jest.fn((resolve) => resolve(resolvedValue));
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
  // Ensure supabase.rpc exists as a mock
  (supabase as any).rpc = jest.fn();
});

// ── awardEngagementCredits ───────────────────────────

describe('awardEngagementCredits', () => {
  it('returns awarded credits on successful RPC call', async () => {
    (supabase as any).rpc.mockResolvedValueOnce({
      data: { credits_awarded: 2, new_balance: 102, error_code: null },
      error: null,
    });

    const { data, error } = await awardEngagementCredits('user-1', 'daily_login');

    expect(error).toBeNull();
    expect(data).toEqual({
      credits_awarded: 2,
      new_balance: 102,
      action: 'daily_login',
    });
    expect((supabase as any).rpc).toHaveBeenCalledWith(
      'award_engagement_credits',
      expect.objectContaining({
        p_user_id: 'user-1',
        p_action: 'daily_login',
        p_credits: ENGAGEMENT_CREDITS.daily_login,
        p_daily_cap: 50,
        p_action_cap: null,
      }),
    );
  });

  it('passes action_cap for receive_like action', async () => {
    (supabase as any).rpc.mockResolvedValueOnce({
      data: { credits_awarded: 0.5, new_balance: 50.5, error_code: null },
      error: null,
    });

    await awardEngagementCredits('user-1', 'receive_like');

    expect((supabase as any).rpc).toHaveBeenCalledWith(
      'award_engagement_credits',
      expect.objectContaining({
        p_action: 'receive_like',
        p_credits: 0.5,
        p_action_cap: 10,
      }),
    );
  });

  it('returns error when daily cap is reached (error_code from RPC)', async () => {
    (supabase as any).rpc.mockResolvedValueOnce({
      data: { error_code: 'DAILY_CAP_REACHED' },
      error: null,
    });

    const { data, error } = await awardEngagementCredits('user-1', 'vote_on_challenge');

    expect(data).toBeNull();
    expect(error).toBe('DAILY_CAP_REACHED');
  });

  it('returns error when RPC call fails', async () => {
    (supabase as any).rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database unavailable' },
    });

    const { data, error } = await awardEngagementCredits('user-1', 'daily_login');

    expect(data).toBeNull();
    expect(error).toBe('Database unavailable');
  });

  it('returns error when duplicate action detected (error_code)', async () => {
    (supabase as any).rpc.mockResolvedValueOnce({
      data: { error_code: 'DUPLICATE_ACTION' },
      error: null,
    });

    const { data, error } = await awardEngagementCredits('user-1', 'first_post_of_day');

    expect(data).toBeNull();
    expect(error).toBe('DUPLICATE_ACTION');
  });

  it('returns error when receive_like daily cap is hit', async () => {
    (supabase as any).rpc.mockResolvedValueOnce({
      data: { error_code: 'ACTION_CAP_REACHED' },
      error: null,
    });

    const { data, error } = await awardEngagementCredits('user-1', 'receive_like');

    expect(data).toBeNull();
    expect(error).toBe('ACTION_CAP_REACHED');
  });

  it('passes metadata when provided', async () => {
    (supabase as any).rpc.mockResolvedValueOnce({
      data: { credits_awarded: 1, new_balance: 10, error_code: null },
      error: null,
    });

    const metadata = { reference_id: 'post-123' };
    await awardEngagementCredits('user-1', 'vote_on_challenge', metadata);

    expect((supabase as any).rpc).toHaveBeenCalledWith(
      'award_engagement_credits',
      expect.objectContaining({
        p_metadata: metadata,
      }),
    );
  });

  it('passes null metadata when not provided', async () => {
    (supabase as any).rpc.mockResolvedValueOnce({
      data: { credits_awarded: 2, new_balance: 12, error_code: null },
      error: null,
    });

    await awardEngagementCredits('user-1', 'daily_login');

    expect((supabase as any).rpc).toHaveBeenCalledWith(
      'award_engagement_credits',
      expect.objectContaining({
        p_metadata: null,
      }),
    );
  });

  it('handles RPC returning an array result', async () => {
    (supabase as any).rpc.mockResolvedValueOnce({
      data: [{ credits_awarded: 5, new_balance: 55, error_code: null }],
      error: null,
    });

    const { data, error } = await awardEngagementCredits('user-1', 'give_constructive_critique');

    expect(error).toBeNull();
    expect(data).toEqual({
      credits_awarded: 5,
      new_balance: 55,
      action: 'give_constructive_critique',
    });
  });
});

// ── getEngagementSummary ─────────────────────────────

describe('getEngagementSummary', () => {
  it('returns empty summary when no actions today', async () => {
    const engagementChain = mockQueryChain({ data: [], error: null });
    const streakChain = mockQueryChain({ data: null, error: null });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return engagementChain;
      return streakChain;
    });

    const { data, error } = await getEngagementSummary('user-1');

    expect(error).toBeNull();
    expect(data).toEqual({
      today_earned: 0,
      daily_cap: 50,
      remaining: 50,
      streak_days: 0,
      actions_today: [],
    });
  });

  it('returns correct totals for multiple actions', async () => {
    const records = [
      { action: 'daily_login', credits: 2 },
      { action: 'receive_like', credits: 0.5 },
      { action: 'receive_like', credits: 0.5 },
      { action: 'first_post_of_day', credits: 3 },
    ];
    const engagementChain = mockQueryChain({ data: records, error: null });
    const streakChain = mockQueryChain({ data: { current_streak: 7 }, error: null });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return engagementChain;
      return streakChain;
    });

    const { data, error } = await getEngagementSummary('user-1');

    expect(error).toBeNull();
    expect(data!.today_earned).toBe(6); // 2 + 0.5 + 0.5 + 3
    expect(data!.remaining).toBe(44); // 50 - 6
    expect(data!.streak_days).toBe(7);
  });

  it('groups actions correctly in actions_today', async () => {
    const records = [
      { action: 'receive_like', credits: 0.5 },
      { action: 'receive_like', credits: 0.5 },
      { action: 'receive_like', credits: 0.5 },
      { action: 'daily_login', credits: 2 },
    ];
    const engagementChain = mockQueryChain({ data: records, error: null });
    const streakChain = mockQueryChain({ data: null, error: null });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return engagementChain;
      return streakChain;
    });

    const { data } = await getEngagementSummary('user-1');

    const likeGroup = data!.actions_today.find((a) => a.action === 'receive_like');
    expect(likeGroup).toEqual({ action: 'receive_like', credits: 1.5, count: 3 });

    const loginGroup = data!.actions_today.find((a) => a.action === 'daily_login');
    expect(loginGroup).toEqual({ action: 'daily_login', credits: 2, count: 1 });
  });

  it('returns error when engagement_credits query fails', async () => {
    const engagementChain = mockQueryChain({ data: null, error: { message: 'DB error' } });
    (supabase.from as jest.Mock).mockReturnValue(engagementChain);

    const { data, error } = await getEngagementSummary('user-1');

    expect(data).toBeNull();
    expect(error).toBe('DB error');
  });

  it('queries engagement_credits and login_streaks tables', async () => {
    const engagementChain = mockQueryChain({ data: [], error: null });
    const streakChain = mockQueryChain({ data: null, error: null });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return engagementChain;
      return streakChain;
    });

    await getEngagementSummary('user-1');

    expect(supabase.from).toHaveBeenCalledWith('engagement_credits');
    expect(supabase.from).toHaveBeenCalledWith('login_streaks');
  });

  it('remaining never goes below zero when over cap', async () => {
    const records = [
      { action: 'win_challenge', credits: 25 },
      { action: 'win_challenge', credits: 25 },
      { action: 'daily_login', credits: 2 },
    ];
    const engagementChain = mockQueryChain({ data: records, error: null });
    const streakChain = mockQueryChain({ data: null, error: null });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return engagementChain;
      return streakChain;
    });

    const { data } = await getEngagementSummary('user-1');

    expect(data!.today_earned).toBe(52);
    expect(data!.remaining).toBe(0); // Math.max(0, 50 - 52)
  });
});

// ── getDailyCreditCap ────────────────────────────────

describe('getDailyCreditCap', () => {
  it('returns full cap (50) when no credits earned today', async () => {
    const chain = mockQueryChain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { remaining, error } = await getDailyCreditCap('user-1');

    expect(error).toBeNull();
    expect(remaining).toBe(50);
  });

  it('returns correct remainder when some credits earned', async () => {
    const chain = mockQueryChain({
      data: [{ credits: 10 }, { credits: 5 }, { credits: 3 }],
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { remaining, error } = await getDailyCreditCap('user-1');

    expect(error).toBeNull();
    expect(remaining).toBe(32); // 50 - 18
  });

  it('returns 0 when cap is fully used', async () => {
    const chain = mockQueryChain({
      data: [{ credits: 25 }, { credits: 25 }],
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { remaining, error } = await getDailyCreditCap('user-1');

    expect(error).toBeNull();
    expect(remaining).toBe(0);
  });

  it('returns 0 remaining (not negative) when over cap', async () => {
    const chain = mockQueryChain({
      data: [{ credits: 30 }, { credits: 25 }],
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { remaining } = await getDailyCreditCap('user-1');

    expect(remaining).toBe(0); // Math.max(0, 50 - 55)
  });

  it('returns error when query fails', async () => {
    const chain = mockQueryChain({ data: null, error: { message: 'Connection refused' } });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { remaining, error } = await getDailyCreditCap('user-1');

    expect(remaining).toBe(0);
    expect(error).toBe('Connection refused');
  });

  it('queries engagement_credits table with correct filters', async () => {
    const chain = mockQueryChain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    await getDailyCreditCap('user-1');

    expect(supabase.from).toHaveBeenCalledWith('engagement_credits');
    expect(chain.select).toHaveBeenCalledWith('credits');
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(chain.gte).toHaveBeenCalled();
    expect(chain.lte).toHaveBeenCalled();
  });
});

// ── ENGAGEMENT_CREDITS map ───────────────────────────

describe('ENGAGEMENT_CREDITS', () => {
  it('has correct credit amount for each action', () => {
    expect(ENGAGEMENT_CREDITS.vote_on_challenge).toBe(1);
    expect(ENGAGEMENT_CREDITS.daily_login).toBe(2);
    expect(ENGAGEMENT_CREDITS.first_post_of_day).toBe(3);
    expect(ENGAGEMENT_CREDITS.receive_like).toBe(0.5);
    expect(ENGAGEMENT_CREDITS.give_constructive_critique).toBe(5);
    expect(ENGAGEMENT_CREDITS.win_challenge).toBe(25);
    expect(ENGAGEMENT_CREDITS.streak_bonus_7_day).toBe(10);
    expect(ENGAGEMENT_CREDITS.streak_bonus_30_day).toBe(50);
    expect(ENGAGEMENT_CREDITS.refer_user).toBe(20);
  });

  it('all credit values are non-negative', () => {
    for (const [, credits] of Object.entries(ENGAGEMENT_CREDITS)) {
      expect(credits).toBeGreaterThanOrEqual(0);
    }
  });

  it('has 9 action types', () => {
    expect(Object.keys(ENGAGEMENT_CREDITS)).toHaveLength(9);
  });
});

// ── ACTION_LABELS ────────────────────────────────────

describe('ACTION_LABELS', () => {
  it('has a label for every action in ENGAGEMENT_CREDITS', () => {
    for (const action of Object.keys(ENGAGEMENT_CREDITS)) {
      expect(ACTION_LABELS[action as EngagementCreditAction]).toBeTruthy();
    }
  });
});

// ── ENGAGEMENT_CREDITS_INFO ──────────────────────────

describe('ENGAGEMENT_CREDITS_INFO', () => {
  it('credits in info array match ENGAGEMENT_CREDITS map', () => {
    for (const info of ENGAGEMENT_CREDITS_INFO) {
      expect(info.credits).toBe(ENGAGEMENT_CREDITS[info.action]);
    }
  });

  it('every entry has action, label, credits, and description', () => {
    for (const info of ENGAGEMENT_CREDITS_INFO) {
      expect(info.action).toBeTruthy();
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(typeof info.credits).toBe('number');
    }
  });
});

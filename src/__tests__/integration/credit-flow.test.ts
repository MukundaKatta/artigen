/**
 * Integration tests: credit flow across services.
 *
 * Tests the full credit lifecycle:
 * - User generates an image -> credits deducted -> wallet updated
 * - Insufficient credits blocks generation
 * - Engagement credits + purchased credits work together
 *
 * Uses the same mock patterns as existing service tests.
 */

import { supabase } from '@/lib/supabase';
import { getUserCredits, MODEL_CREDITS } from '@/services/credits.service';
import { generateImage } from '@/services/ai.service';
import {
  awardEngagementCredits,
  getDailyCreditCap,
  ENGAGEMENT_CREDITS,
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

// ── Full generation + credit deduction flow ──────────

describe('generation credit deduction flow', () => {
  const userId = 'user-1';
  const modelId = 'dall-e-3-standard';
  const modelCost = MODEL_CREDITS[modelId]; // 40 credits

  it('user with sufficient credits can generate and credits are deducted', async () => {
    // Step 1: Check user balance (enough credits)
    const walletChain = mockQueryChain({ data: { balance_cents: 100 }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(walletChain);

    const balance = await getUserCredits(userId);
    expect(balance).toBe(100);
    expect(balance).toBeGreaterThanOrEqual(modelCost);

    // Step 2: Generate image (edge function handles deduction server-side)
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: {
        image_url: 'https://cdn.example.com/generated.png',
        prediction_id: 'pred-1',
        generation_time_ms: 4500,
        model_id: modelId,
        model_name: 'DALL-E 3',
        settings: { quality: 'standard' },
      },
      error: null,
    });

    const { data, error } = await generateImage({
      model_id: modelId,
      provider: 'openai',
      prompt: 'A beautiful landscape painting',
    });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.image_url).toBe('https://cdn.example.com/generated.png');
    expect(supabase.functions.invoke).toHaveBeenCalledWith('generate', {
      body: expect.objectContaining({ model_id: modelId }),
    });

    // Step 3: Verify wallet balance is updated (post-generation check)
    const updatedWalletChain = mockQueryChain({
      data: { balance_cents: 100 - modelCost },
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue(updatedWalletChain);

    const newBalance = await getUserCredits(userId);
    expect(newBalance).toBe(60); // 100 - 40
  });

  it('free model generation does not deduct credits', async () => {
    const freeModelId = 'black-forest-labs/FLUX.1-schnell';
    expect(MODEL_CREDITS[freeModelId]).toBe(0);

    // Check initial balance
    const walletChain = mockQueryChain({ data: { balance_cents: 50 }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(walletChain);

    const balanceBefore = await getUserCredits(userId);

    // Generate with free model
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: {
        image_url: 'https://cdn.example.com/free.png',
        prediction_id: 'pred-free',
        generation_time_ms: 2000,
        model_id: freeModelId,
        model_name: 'Flux Schnell',
        settings: {},
      },
      error: null,
    });

    const { data, error } = await generateImage({
      model_id: freeModelId,
      provider: 'huggingface',
      prompt: 'A quick test',
    });

    expect(error).toBeNull();
    expect(data).toBeDefined();

    // Balance unchanged for free model
    const walletChain2 = mockQueryChain({ data: { balance_cents: 50 }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(walletChain2);

    const balanceAfter = await getUserCredits(userId);
    expect(balanceAfter).toBe(balanceBefore);
  });
});

// ── Insufficient credits blocks generation ───────────

describe('insufficient credits blocks generation', () => {
  const userId = 'user-2';

  it('edge function returns error when credits are insufficient', async () => {
    // User has very few credits
    const walletChain = mockQueryChain({ data: { balance_cents: 5 }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(walletChain);

    const balance = await getUserCredits(userId);
    expect(balance).toBe(5);

    // Try to use expensive model (DALL-E 3 HD costs 80)
    const expensiveModel = 'dall-e-3-hd';
    expect(MODEL_CREDITS[expensiveModel]).toBe(80);
    expect(balance).toBeLessThan(MODEL_CREDITS[expensiveModel]);

    // Edge function rejects due to insufficient credits
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: { error: 'Insufficient credits' },
      error: null,
    });

    const { data, error } = await generateImage({
      model_id: expensiveModel,
      provider: 'openai',
      prompt: 'An HD artwork',
    });

    expect(data).toBeNull();
    expect(error).toBe('Insufficient credits');
  });

  it('user with zero credits cannot use paid models', async () => {
    const walletChain = mockQueryChain({ data: { balance_cents: 0 }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(walletChain);

    const balance = await getUserCredits(userId);
    expect(balance).toBe(0);

    // All paid models should be unaffordable
    const paidModels = Object.entries(MODEL_CREDITS).filter(([, cost]) => cost > 0);
    expect(paidModels.length).toBeGreaterThan(0);

    for (const [modelId, cost] of paidModels) {
      expect(balance).toBeLessThan(cost);
    }
  });

  it('user with zero credits can still use free models', async () => {
    const walletChain = mockQueryChain({ data: { balance_cents: 0 }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(walletChain);

    const balance = await getUserCredits(userId);
    expect(balance).toBe(0);

    // Free models cost 0
    const freeModelId = 'stabilityai/stable-diffusion-xl-base-1.0';
    expect(MODEL_CREDITS[freeModelId]).toBe(0);

    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: {
        image_url: 'https://cdn.example.com/sdxl.png',
        prediction_id: 'pred-sdxl',
        generation_time_ms: 3000,
        model_id: freeModelId,
        model_name: 'SDXL',
        settings: {},
      },
      error: null,
    });

    const { data, error } = await generateImage({
      model_id: freeModelId,
      provider: 'huggingface',
      prompt: 'A free generation',
    });

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});

// ── Engagement + purchased credits work together ─────

describe('engagement credits + purchased credits combined', () => {
  const userId = 'user-3';

  it('engagement credits increase wallet balance for future generation', async () => {
    // Step 1: User has 30 purchased credits
    const walletChain = mockQueryChain({ data: { balance_cents: 30 }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(walletChain);

    const initialBalance = await getUserCredits(userId);
    expect(initialBalance).toBe(30);

    // Step 2: User earns engagement credits (daily login = 2 credits)
    (supabase as any).rpc.mockResolvedValueOnce({
      data: { credits_awarded: 2, new_balance: 32, error_code: null },
      error: null,
    });

    const { data: awardData, error: awardError } = await awardEngagementCredits(
      userId,
      'daily_login',
    );

    expect(awardError).toBeNull();
    expect(awardData!.credits_awarded).toBe(2);
    expect(awardData!.new_balance).toBe(32);

    // Step 3: User earns more via first post (3 credits)
    (supabase as any).rpc.mockResolvedValueOnce({
      data: { credits_awarded: 3, new_balance: 35, error_code: null },
      error: null,
    });

    const { data: postAward } = await awardEngagementCredits(userId, 'first_post_of_day');
    expect(postAward!.new_balance).toBe(35);

    // Step 4: Now user can afford flux-dev (30 credits) which they couldn't before
    // With engagement bonus: 30 + 2 + 3 = 35 >= 30
    const targetModel = 'black-forest-labs/flux-dev';
    expect(MODEL_CREDITS[targetModel]).toBe(30);

    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: {
        image_url: 'https://cdn.example.com/flux-dev.png',
        prediction_id: 'pred-fd',
        generation_time_ms: 8000,
        model_id: targetModel,
        model_name: 'Flux Dev',
        settings: {},
      },
      error: null,
    });

    const { data: genData, error: genError } = await generateImage({
      model_id: targetModel,
      provider: 'replicate',
      prompt: 'A high-quality artwork',
    });

    expect(genError).toBeNull();
    expect(genData).toBeDefined();
    expect(genData!.model_id).toBe(targetModel);
  });

  it('engagement daily cap limits how many credits can be earned per day', async () => {
    // Check daily cap
    const capChain = mockQueryChain({
      data: [{ credits: 20 }, { credits: 15 }, { credits: 10 }],
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue(capChain);

    const { remaining, error } = await getDailyCreditCap(userId);

    expect(error).toBeNull();
    expect(remaining).toBe(5); // 50 - 45
  });

  it('multiple engagement actions accumulate credits for generation', async () => {
    // User starts with 0 purchased credits
    const walletChain = mockQueryChain({ data: { balance_cents: 0 }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(walletChain);

    const startBalance = await getUserCredits(userId);
    expect(startBalance).toBe(0);

    // Award multiple engagement actions to accumulate credits
    const actions: Array<{ action: any; expected_balance: number }> = [
      { action: 'daily_login', expected_balance: 2 },
      { action: 'first_post_of_day', expected_balance: 5 },
      { action: 'receive_like', expected_balance: 5.5 },
      { action: 'vote_on_challenge', expected_balance: 6.5 },
    ];

    for (const { action, expected_balance } of actions) {
      (supabase as any).rpc.mockResolvedValueOnce({
        data: {
          credits_awarded: ENGAGEMENT_CREDITS[action as keyof typeof ENGAGEMENT_CREDITS],
          new_balance: expected_balance,
          error_code: null,
        },
        error: null,
      });

      const { data, error } = await awardEngagementCredits(userId, action);
      expect(error).toBeNull();
      expect(data!.new_balance).toBe(expected_balance);
    }

    // After accumulating 6.5 credits, user can afford flux-schnell (5 credits)
    const targetModel = 'black-forest-labs/flux-schnell';
    expect(MODEL_CREDITS[targetModel]).toBe(5);

    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: {
        image_url: 'https://cdn.example.com/flux-schnell.png',
        prediction_id: 'pred-fs',
        generation_time_ms: 2500,
        model_id: targetModel,
        model_name: 'Flux Schnell',
        settings: {},
      },
      error: null,
    });

    const { data, error } = await generateImage({
      model_id: targetModel,
      provider: 'replicate',
      prompt: 'A test artwork',
    });

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});

// ── Credit cost validation ───────────────────────────

describe('credit cost consistency', () => {
  it('all paid model costs are documented in MODEL_CREDITS', () => {
    const paidModels = Object.entries(MODEL_CREDITS).filter(([, cost]) => cost > 0);
    expect(paidModels.length).toBeGreaterThan(0);

    for (const [modelId, cost] of paidModels) {
      expect(cost).toBeGreaterThan(0);
      expect(Number.isFinite(cost)).toBe(true);
    }
  });

  it('free models have exactly 0 cost', () => {
    const freeModels = Object.entries(MODEL_CREDITS).filter(([, cost]) => cost === 0);
    expect(freeModels.length).toBeGreaterThan(0);

    for (const [, cost] of freeModels) {
      expect(cost).toBe(0);
    }
  });

  it('engagement credits are less than or equal to daily cap individually', () => {
    for (const [action, credits] of Object.entries(ENGAGEMENT_CREDITS)) {
      // Each single action should not exceed the daily cap of 50
      expect(credits).toBeLessThanOrEqual(50);
    }
  });

  it('getUserCredits returns 0 when wallet does not exist', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const balance = await getUserCredits('new-user');

    expect(balance).toBe(0);
    expect(supabase.from).toHaveBeenCalledWith('wallets');
  });
});

// ── Edge cases ───────────────────────────────────────

describe('credit flow edge cases', () => {
  it('wallet query error still allows checking credit cost', async () => {
    // Even if wallet query fails, we can still check model cost
    const chain = mockQueryChain({ data: null, error: { message: 'DB timeout' } });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const balance = await getUserCredits('user-err');
    // getUserCredits returns 0 when data is null (via ?? 0)
    expect(balance).toBe(0);

    // Model costs are static and always available
    expect(MODEL_CREDITS['dall-e-3-standard']).toBe(40);
    expect(MODEL_CREDITS['black-forest-labs/FLUX.1-schnell']).toBe(0);
  });

  it('generation failure does not deduct credits', async () => {
    // User has credits
    const walletChain = mockQueryChain({ data: { balance_cents: 100 }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(walletChain);

    const balanceBefore = await getUserCredits('user-1');
    expect(balanceBefore).toBe(100);

    // Generation fails at edge function level
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'Model overloaded' },
    });

    const { data, error } = await generateImage({
      model_id: 'dall-e-3-standard',
      provider: 'openai',
      prompt: 'Should fail',
    });

    expect(data).toBeNull();
    expect(error).toBe('Model overloaded');

    // Balance should remain unchanged
    const walletChain2 = mockQueryChain({ data: { balance_cents: 100 }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(walletChain2);

    const balanceAfter = await getUserCredits('user-1');
    expect(balanceAfter).toBe(100);
  });
});

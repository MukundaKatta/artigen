import { CREDIT_PACKAGES, MODEL_CREDITS, TEXT_AI_CREDITS } from '@/services/credits.service';
import { AI_MODELS } from '@/services/ai.service';
import { ENGAGEMENT_REWARDS_INFO } from '@/services/engagement-rewards.service';

describe('MODEL_CREDITS', () => {
  it('has a credit entry for every AI model', () => {
    for (const model of AI_MODELS) {
      expect(model.id in MODEL_CREDITS).toBe(true);
    }
  });

  it('free HuggingFace models cost 0 credits', () => {
    const freeModels = AI_MODELS.filter((m) => m.provider === 'huggingface');
    expect(freeModels.length).toBeGreaterThan(0);
    for (const model of freeModels) {
      expect(MODEL_CREDITS[model.id]).toBe(0);
    }
  });

  it('paid models cost > 0 credits', () => {
    const paidProviders = ['replicate', 'openai', 'gemini'];
    const paidModels = AI_MODELS.filter((m) => paidProviders.includes(m.provider));
    expect(paidModels.length).toBeGreaterThan(0);
    for (const model of paidModels) {
      expect(MODEL_CREDITS[model.id]).toBeGreaterThan(0);
    }
  });

  it('all credit values are non-negative integers', () => {
    for (const [, credits] of Object.entries(MODEL_CREDITS)) {
      expect(credits).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(credits)).toBe(true);
    }
  });
});

describe('CREDIT_PACKAGES', () => {
  it('has at least 3 packages', () => {
    expect(CREDIT_PACKAGES.length).toBeGreaterThanOrEqual(3);
  });

  it('each package has valid structure', () => {
    for (const pkg of CREDIT_PACKAGES) {
      expect(pkg.id).toBeTruthy();
      expect(pkg.label).toBeTruthy();
      expect(pkg.price_usd).toBeGreaterThan(0);
      expect(pkg.price_inr).toBeGreaterThan(0);
      expect(pkg.credits).toBeGreaterThan(0);
      expect(pkg.bonus).toBeGreaterThanOrEqual(0);
    }
  });

  it('packages are ordered by ascending price', () => {
    for (let i = 1; i < CREDIT_PACKAGES.length; i++) {
      expect(CREDIT_PACKAGES[i].price_usd).toBeGreaterThan(CREDIT_PACKAGES[i - 1].price_usd);
    }
  });

  it('higher-tier packages give better credits-per-dollar', () => {
    const ratios = CREDIT_PACKAGES.map((p) => p.credits / p.price_usd);
    for (let i = 1; i < ratios.length; i++) {
      expect(ratios[i]).toBeGreaterThan(ratios[i - 1]);
    }
  });

  it('exactly one package is marked popular', () => {
    const popular = CREDIT_PACKAGES.filter((p) => p.popular);
    expect(popular.length).toBe(1);
  });
});

describe('TEXT_AI_CREDITS', () => {
  it('is a positive integer', () => {
    expect(TEXT_AI_CREDITS).toBeGreaterThan(0);
    expect(Number.isInteger(TEXT_AI_CREDITS)).toBe(true);
  });
});

describe('AI_MODELS', () => {
  it('has at least 10 models', () => {
    expect(AI_MODELS.length).toBeGreaterThanOrEqual(10);
  });

  it('every model has required fields', () => {
    for (const model of AI_MODELS) {
      expect(model.id).toBeTruthy();
      expect(model.name).toBeTruthy();
      expect(model.description).toBeTruthy();
      expect(model.category).toBe('image');
      expect(['huggingface', 'replicate', 'openai', 'gemini']).toContain(model.provider);
      expect(model.defaultSettings).toBeDefined();
      expect(model.defaultSettings.width).toBeGreaterThan(0);
      expect(model.defaultSettings.height).toBeGreaterThan(0);
      expect(model.maxSteps).toBeGreaterThan(0);
    }
  });

  it('model IDs are unique', () => {
    const ids = AI_MODELS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes all 4 providers', () => {
    const providers = new Set(AI_MODELS.map((m) => m.provider));
    expect(providers).toContain('huggingface');
    expect(providers).toContain('replicate');
    expect(providers).toContain('openai');
    expect(providers).toContain('gemini');
  });
});

describe('ENGAGEMENT_REWARDS_INFO', () => {
  it('has at least 3 reward types', () => {
    expect(ENGAGEMENT_REWARDS_INFO.length).toBeGreaterThanOrEqual(3);
  });

  it('each reward has required fields', () => {
    for (const info of ENGAGEMENT_REWARDS_INFO) {
      expect(info.action).toBeTruthy();
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.credits).toBeGreaterThanOrEqual(0);
    }
  });

  it('daily_login gives meaningful credits', () => {
    const login = ENGAGEMENT_REWARDS_INFO.find((r) => r.action === 'daily_login');
    expect(login).toBeDefined();
    expect(login!.credits).toBeGreaterThanOrEqual(5);
  });
});

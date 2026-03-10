import { checkRateLimit, getRemainingTokens, withRateLimit, RateLimitError } from '@/lib/rate-limiter';

describe('rate-limiter', () => {
  it('allows requests within the limit', () => {
    // Default unknown key has 10 tokens
    expect(checkRateLimit('test:unique:1')).toBe(true);
    expect(checkRateLimit('test:unique:1')).toBe(true);
  });

  it('blocks requests when tokens are exhausted', () => {
    const key = 'test:exhaust';
    // Drain all tokens (default: 10)
    for (let i = 0; i < 10; i++) {
      checkRateLimit(key);
    }
    expect(checkRateLimit(key)).toBe(false);
  });

  it('reports remaining tokens', () => {
    const key = 'test:remaining';
    const initial = getRemainingTokens(key);
    checkRateLimit(key);
    expect(getRemainingTokens(key)).toBeLessThan(initial);
  });

  it('withRateLimit throws RateLimitError when exceeded', async () => {
    const key = 'test:throw';
    // Drain tokens
    for (let i = 0; i < 10; i++) {
      checkRateLimit(key);
    }

    await expect(
      withRateLimit(key, async () => 'should not reach'),
    ).rejects.toThrow(RateLimitError);
  });

  it('withRateLimit executes function when allowed', async () => {
    const result = await withRateLimit('test:allowed', async () => 42);
    expect(result).toBe(42);
  });
});

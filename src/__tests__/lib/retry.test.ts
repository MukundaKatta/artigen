import { withRetry, _resetRetryBudgetForTests, getRetryBudgetState } from '@/lib/retry';

beforeEach(() => {
  _resetRetryBudgetForTests();
});

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await withRetry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable errors and recovers', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue('recovered');

    // Use minimal delays so the test doesn't timeout
    const result = await withRetry(fn, {
      maxRetries: 2,
      baseDelay: 1,
      maxDelay: 1,
      jitter: false,
    });

    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws on non-retryable errors immediately', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Validation error'));

    await expect(
      withRetry(fn, { maxRetries: 3, baseDelay: 1, jitter: false }),
    ).rejects.toThrow('Validation error');

    // Non-retryable errors should not trigger retries
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws after exhausting all retries', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Network error'));

    await expect(
      withRetry(fn, { maxRetries: 2, baseDelay: 1, maxDelay: 1, jitter: false }),
    ).rejects.toThrow('Network error');

    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('uses custom retryable predicate', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Custom retryable'))
      .mockResolvedValue('ok');

    const result = await withRetry(fn, {
      maxRetries: 1,
      baseDelay: 1,
      maxDelay: 1,
      jitter: false,
      isRetryable: (err) => err instanceof Error && err.message.includes('retryable'),
    });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('withRetry global budget', () => {
  it('records consumed retries in the budget', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue('ok');

    expect(getRetryBudgetState().used).toBe(0);

    await withRetry(fn, { maxRetries: 2, baseDelay: 1, maxDelay: 1, jitter: false });

    // One retry consumed
    expect(getRetryBudgetState().used).toBe(1);
  });

  it('does not consume budget on first-attempt success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    await withRetry(fn);
    expect(getRetryBudgetState().used).toBe(0);
  });

  it('fails fast (without sleeping/retrying) when budget is exhausted', async () => {
    // Fill the budget by calling the internal reset and then pushing 100 retries
    // via the public API. Each iteration uses maxRetries:1 so each failing call
    // consumes exactly one budget entry.
    const failing = jest.fn().mockRejectedValue(new Error('Network error'));
    for (let i = 0; i < 100; i++) {
      try {
        await withRetry(failing, { maxRetries: 1, baseDelay: 1, maxDelay: 1, jitter: false });
      } catch {
        // expected
      }
    }

    expect(getRetryBudgetState().used).toBe(100);

    // Next retryable failure should NOT retry — should reject after the first attempt
    const nextFn = jest.fn().mockRejectedValue(new Error('Network error'));
    await expect(
      withRetry(nextFn, { maxRetries: 5, baseDelay: 1, maxDelay: 1, jitter: false }),
    ).rejects.toThrow('Network error');

    expect(nextFn).toHaveBeenCalledTimes(1);
  });

  it('exposes window/limit via getRetryBudgetState', () => {
    const state = getRetryBudgetState();
    expect(state.limit).toBe(100);
    expect(state.windowMs).toBe(60_000);
  });
});

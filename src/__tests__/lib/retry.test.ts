import { withRetry } from '@/lib/retry';

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

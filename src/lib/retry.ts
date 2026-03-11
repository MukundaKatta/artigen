/**
 * Retry utility with exponential backoff for transient failures.
 *
 * Used by service layer to automatically retry failed Supabase calls
 * (network timeouts, 5xx errors) without manual intervention.
 */

export type RetryOptions = {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in ms (default: 1000) */
  baseDelay?: number;
  /** Maximum delay in ms (default: 10000) */
  maxDelay?: number;
  /** Whether to add jitter to prevent thundering herd (default: true) */
  jitter?: boolean;
  /** Optional predicate to decide if an error is retryable */
  isRetryable?: (error: unknown) => boolean;
};

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10_000,
  jitter: true,
  isRetryable: defaultIsRetryable,
};

function defaultIsRetryable(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    // Retry on network errors and server errors
    return (
      msg.includes('network') ||
      msg.includes('timeout') ||
      msg.includes('fetch') ||
      msg.includes('econnrefused') ||
      msg.includes('502') ||
      msg.includes('503') ||
      msg.includes('504')
    );
  }
  return false;
}

function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const exponentialDelay = options.baseDelay * Math.pow(2, attempt);
  const bounded = Math.min(exponentialDelay, options.maxDelay);
  if (!options.jitter) return bounded;
  // Full jitter: random value between 0 and bounded
  return Math.floor(Math.random() * bounded);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === opts.maxRetries || !opts.isRetryable(error)) {
        throw error;
      }
      const delay = calculateDelay(attempt, opts);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

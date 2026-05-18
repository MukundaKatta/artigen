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

// ── Global retry budget ────────────────────────────────
//
// Per-window cap on RETRY attempts (the initial call doesn't count) across
// the entire process. Prevents a server-side outage from cascading into a
// self-inflicted DDoS where every active caller burns its full retry budget
// in lockstep.
//
// Implementation: sliding-window timestamp ring. When a retry is requested
// and the window is full, `withRetry` gives up and throws the underlying
// error immediately instead of waiting + retrying.

const BUDGET_WINDOW_MS = 60_000;
const BUDGET_MAX_RETRIES = 100;
const retryTimestamps: number[] = [];

function tryConsumeBudget(): boolean {
  const now = Date.now();
  const cutoff = now - BUDGET_WINDOW_MS;
  // Drop expired entries (the array is append-only and sorted ascending)
  while (retryTimestamps.length > 0 && retryTimestamps[0] < cutoff) {
    retryTimestamps.shift();
  }
  if (retryTimestamps.length >= BUDGET_MAX_RETRIES) return false;
  retryTimestamps.push(now);
  return true;
}

/** Exposed for tests only. */
export function _resetRetryBudgetForTests() {
  retryTimestamps.length = 0;
}

/** Exposed for tests / telemetry. */
export function getRetryBudgetState() {
  const now = Date.now();
  const cutoff = now - BUDGET_WINDOW_MS;
  const live = retryTimestamps.filter((t) => t >= cutoff).length;
  return { used: live, limit: BUDGET_MAX_RETRIES, windowMs: BUDGET_WINDOW_MS };
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
      const isLastAttempt = attempt === opts.maxRetries;
      if (isLastAttempt || !opts.isRetryable(error)) {
        throw error;
      }
      // Budget check before sleeping + retrying. If we're out of budget,
      // surface the error immediately so the caller can fail fast rather
      // than amplify load.
      if (!tryConsumeBudget()) {
        throw error;
      }
      const delay = calculateDelay(attempt, opts);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

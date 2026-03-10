/**
 * Client-side rate limiter using token bucket algorithm.
 *
 * Prevents abuse by limiting how frequently certain actions can be performed.
 * This is a client-side guard — server-side rate limiting should also be enforced.
 */

type BucketConfig = {
  /** Maximum tokens in the bucket */
  maxTokens: number;
  /** Tokens added per second */
  refillRate: number;
};

type Bucket = {
  tokens: number;
  lastRefill: number;
  config: BucketConfig;
};

const buckets = new Map<string, Bucket>();

const PRESET_LIMITS: Record<string, BucketConfig> = {
  'api:generate': { maxTokens: 5, refillRate: 0.1 },       // 5 burst, 1 per 10s
  'api:post:create': { maxTokens: 3, refillRate: 0.05 },    // 3 burst, 1 per 20s
  'api:like': { maxTokens: 10, refillRate: 2 },              // 10 burst, 2 per second
  'api:comment': { maxTokens: 5, refillRate: 0.5 },          // 5 burst, 1 per 2s
  'api:follow': { maxTokens: 10, refillRate: 0.5 },          // 10 burst, 1 per 2s
  'api:message': { maxTokens: 10, refillRate: 1 },            // 10 burst, 1 per second
  'api:search': { maxTokens: 10, refillRate: 1 },             // 10 burst, 1 per second
  'api:upload': { maxTokens: 3, refillRate: 0.2 },            // 3 burst, 1 per 5s
};

function getBucket(key: string): Bucket {
  const existing = buckets.get(key);
  if (existing) return existing;

  const config = PRESET_LIMITS[key] || { maxTokens: 10, refillRate: 1 };
  const bucket: Bucket = {
    tokens: config.maxTokens,
    lastRefill: Date.now(),
    config,
  };
  buckets.set(key, bucket);
  return bucket;
}

function refill(bucket: Bucket): void {
  const now = Date.now();
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(
    bucket.config.maxTokens,
    bucket.tokens + elapsed * bucket.config.refillRate,
  );
  bucket.lastRefill = now;
}

/**
 * Check if an action is allowed under the rate limit.
 * Returns true and consumes a token if allowed.
 */
export function checkRateLimit(key: string): boolean {
  const bucket = getBucket(key);
  refill(bucket);

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true;
  }
  return false;
}

/**
 * Get remaining tokens for a given rate limit key.
 */
export function getRemainingTokens(key: string): number {
  const bucket = getBucket(key);
  refill(bucket);
  return Math.floor(bucket.tokens);
}

/**
 * Wrap an async function with rate limiting. Throws if rate limited.
 */
export async function withRateLimit<T>(
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  if (!checkRateLimit(key)) {
    throw new RateLimitError(key);
  }
  return fn();
}

export class RateLimitError extends Error {
  readonly key: string;
  constructor(key: string) {
    super(`Rate limit exceeded for "${key}". Please try again shortly.`);
    this.name = 'RateLimitError';
    this.key = key;
  }
}

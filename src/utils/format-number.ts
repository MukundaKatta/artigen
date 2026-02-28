/**
 * Formats a number into a compact string like "1.2K", "3.5M", etc.
 * Used for follower counts, likes, etc.
 */
export function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1_000_000) {
    const k = num / 1000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  if (num < 1_000_000_000) {
    const m = num / 1_000_000;
    return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
  }
  const b = num / 1_000_000_000;
  return b % 1 === 0 ? `${b}B` : `${b.toFixed(1)}B`;
}

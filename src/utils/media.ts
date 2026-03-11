import type { PostMedia } from '@/types/database';

/** Sort post media by sort_order field. Returns a new sorted array. */
export function sortMediaByOrder(media: PostMedia[] | undefined | null): PostMedia[] {
  if (!media || media.length === 0) return [];
  return [...media].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

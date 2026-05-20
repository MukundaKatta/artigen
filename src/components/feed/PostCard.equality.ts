import type { FeedPost } from '@/types';

/**
 * Subset of `PostCardProps` that the equality check actually inspects.
 * Lives in its own file so the comparator can be unit-tested without
 * pulling in the JSX-laden PostCard component.
 */
export type PostCardEqualityInput = {
  currentUserId: string;
  post: FeedPost;
};

/**
 * Custom equality check used by `React.memo(PostCard, ...)`.
 *
 * Re-render only when the fields PostCard actually renders have changed.
 * Skips re-renders when the parent passes a fresh object identity (very
 * common during scroll / pagination) but the underlying post data is
 * unchanged — the biggest source of wasted PostCard renders.
 */
export function arePostsEqual(prev: PostCardEqualityInput, next: PostCardEqualityInput): boolean {
  if (prev.currentUserId !== next.currentUserId) return false;
  const a = prev.post;
  const b = next.post;
  return (
    a.id === b.id &&
    a.isLiked === b.isLiked &&
    a.isSaved === b.isSaved &&
    a.likes_count === b.likes_count &&
    a.comments_count === b.comments_count &&
    a.views_count === b.views_count &&
    a.is_pinned === b.is_pinned &&
    a.is_archived === b.is_archived &&
    a.caption === b.caption &&
    a.userReaction === b.userReaction &&
    a.remixCount === b.remixCount &&
    a.reactionSummary === b.reactionSummary &&
    a.media === b.media
  );
}

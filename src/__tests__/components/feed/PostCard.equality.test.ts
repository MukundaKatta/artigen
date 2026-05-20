import { arePostsEqual, type PostCardEqualityInput } from '@/components/feed/PostCard.equality';
import type { FeedPost } from '@/types';

function makePost(overrides: Partial<FeedPost> = {}): FeedPost {
  return {
    id: 'p1',
    user_id: 'u1',
    caption: 'hello',
    audience: 'everyone',
    likes_count: 10,
    comments_count: 2,
    views_count: 100,
    is_pinned: false,
    is_archived: false,
    is_draft: false,
    scheduled_at: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    isLiked: false,
    isSaved: false,
    userReaction: null,
    reactionSummary: undefined,
    remixCount: 0,
    user: { id: 'u1', username: 'alice', avatar_url: null } as FeedPost['user'],
    media: [],
    ai_metadata: null,
    ...overrides,
  } as unknown as FeedPost;
}

function input(post: FeedPost, currentUserId = 'viewer'): PostCardEqualityInput {
  return { currentUserId, post };
}

describe('arePostsEqual', () => {
  it('returns true for the same input', () => {
    const p = makePost();
    expect(arePostsEqual(input(p), input(p))).toBe(true);
  });

  it('returns true when posts differ by identity but compared fields are equal (shared media ref)', () => {
    const sharedMedia: FeedPost['media'] = [];
    const a = makePost({ media: sharedMedia });
    const b = makePost({ media: sharedMedia });
    expect(arePostsEqual(input(a), input(b))).toBe(true);
  });

  it('returns false when currentUserId changes', () => {
    const p = makePost();
    expect(arePostsEqual(input(p, 'viewer-a'), input(p, 'viewer-b'))).toBe(false);
  });

  it.each([
    ['id', { id: 'p2' }],
    ['isLiked', { isLiked: true }],
    ['isSaved', { isSaved: true }],
    ['likes_count', { likes_count: 11 }],
    ['comments_count', { comments_count: 3 }],
    ['views_count', { views_count: 101 }],
    ['is_pinned', { is_pinned: true }],
    ['is_archived', { is_archived: true }],
    ['caption', { caption: 'updated' }],
    ['userReaction', { userReaction: 'love' as const }],
    ['remixCount', { remixCount: 5 }],
  ])('returns false when %s changes', (_label, change) => {
    const a = makePost();
    const b = makePost(change as Partial<FeedPost>);
    expect(arePostsEqual(input(a), input(b))).toBe(false);
  });

  it('returns false when media reference changes (different array)', () => {
    const a = makePost({ media: [] });
    const b = makePost({ media: [] }); // fresh array → different identity
    expect(arePostsEqual(input(a), input(b))).toBe(false);
  });

  it('returns true when media reference is the same', () => {
    const sharedMedia: FeedPost['media'] = [];
    const a = makePost({ media: sharedMedia });
    const b = makePost({ media: sharedMedia });
    expect(arePostsEqual(input(a), input(b))).toBe(true);
  });

  it('ignores fields the comparator does not track (deep post.user changes)', () => {
    const sharedMedia: FeedPost['media'] = [];
    const a = makePost({ media: sharedMedia });
    const b = makePost({
      // changing nested user object is intentionally NOT a re-render trigger
      // because PostCardHeader doesn't accept new user identity per render in
      // a way that matters for the card. Document this with the test.
      user: { id: 'u1', username: 'alice2', avatar_url: null } as FeedPost['user'],
      media: sharedMedia,
    });
    expect(arePostsEqual(input(a), input(b))).toBe(true);
  });
});

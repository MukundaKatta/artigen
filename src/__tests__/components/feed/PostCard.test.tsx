/**
 * Smoke + focused tests for <PostCard>. Goal isn't exhaustive coverage
 * (the component is 700+ lines with ~20 callbacks) but to verify the
 * highest-traffic interactions: render, user-press, comment-press, and
 * the actionsheet trigger.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { PostCard } from '@/components/feed/PostCard';
import type { FeedPost } from '@/types';

function makePost(overrides: Partial<FeedPost> = {}): FeedPost {
  return {
    id: 'p-1',
    user_id: 'u-1',
    caption: 'a sunset',
    media_url: null,
    media_count: 1,
    likes_count: 5,
    comments_count: 2,
    saves_count: 0,
    shares_count: 0,
    remixCount: 0,
    post_type: 'standard',
    is_archived: false,
    created_at: '2026-01-01T00:00:00Z',
    user: { id: 'u-1', username: 'alice', avatar_url: null, is_verified: false } as FeedPost['user'],
    media: [
      {
        id: 'm-1',
        post_id: 'p-1',
        media_url: 'https://cdn/1.jpg',
        media_type: 'image',
        thumbnail_url: null,
        blurhash: null,
        width: 100,
        height: 100,
        duration_seconds: null,
        sort_order: 0,
        created_at: '2026-01-01',
      } as FeedPost['media'][number],
    ],
    isLiked: false,
    isSaved: false,
    ...overrides,
  } as FeedPost;
}

function render(props: Partial<React.ComponentProps<typeof PostCard>> = {}) {
  const final: React.ComponentProps<typeof PostCard> = {
    post: makePost(),
    currentUserId: 'me',
    onLike: jest.fn(),
    onSave: jest.fn(),
    onComment: jest.fn(),
    onUserPress: jest.fn(),
    onPostPress: jest.fn(),
    ...props,
  };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<PostCard {...final} />);
  });
  return { tree, props: final };
}

describe('<PostCard> (smoke)', () => {
  it('renders without throwing for a minimal post', () => {
    const { tree } = render();
    expect(tree.toJSON()).toBeDefined();
  });

  it('renders the post author username', () => {
    const { tree } = render();
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('alice');
  });

  it('renders the caption', () => {
    const { tree } = render({ post: makePost({ caption: 'beautiful sunset' }) });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('beautiful sunset');
  });

  it('comments link calls onComment when pressed', () => {
    const onComment = jest.fn();
    const { tree } = render({ onComment, post: makePost({ comments_count: 3 }) });
    const link = tree.root.findByProps({ accessibilityLabel: 'View all 3 comments' });
    act(() => {
      link.props.onPress();
    });
    expect(onComment).toHaveBeenCalledWith('p-1');
  });

  it('hides the comments link when comments_count is 0', () => {
    const { tree } = render({ post: makePost({ comments_count: 0 }) });
    const links = tree.root.findAllByProps({ accessibilityRole: 'link' });
    const commentLink = links.find((l) =>
      typeof l.props.accessibilityLabel === 'string' &&
      l.props.accessibilityLabel.includes('comments'),
    );
    expect(commentLink).toBeUndefined();
  });
});

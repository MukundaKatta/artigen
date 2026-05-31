import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import type { Profile } from '@/types/database';

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'u-1',
    username: 'alice',
    full_name: 'Alice Liddell',
    bio: 'art lover',
    avatar_url: null,
    website: null,
    is_verified: false,
    is_private: false,
    followers_count: 12,
    following_count: 7,
    posts_count: 3,
    show_activity_status: true,
    last_active_at: null,
    profile_theme: null,
    portfolio_enabled: false,
    portfolio_bio: null,
    portfolio_contact_email: null,
    interest_tags: null,
    subscriber_badge_label: null,
    subscriber_badge_color: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    ...overrides,
  } as unknown as Profile;
}

function render(props: Partial<React.ComponentProps<typeof ProfileHeader>> = {}) {
  const base: React.ComponentProps<typeof ProfileHeader> = {
    profile: makeProfile(),
    isCurrentUser: false,
    isFollowing: false,
    followLoading: false,
    onFollowPress: jest.fn(),
    onEditPress: jest.fn(),
    onFollowersPress: jest.fn(),
    onFollowingPress: jest.fn(),
  };
  const final = { ...base, ...props };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<ProfileHeader {...final} />);
  });
  return { tree, props: final };
}

describe('<ProfileHeader>', () => {
  it('renders the username and full name', () => {
    const { tree } = render();
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('alice');
    expect(json).toContain('Alice Liddell');
  });

  it('shows Edit Profile button when isCurrentUser is true', () => {
    const onEditPress = jest.fn();
    const { tree } = render({ isCurrentUser: true, onEditPress });
    const editBtns = tree.root
      .findAllByProps({ accessibilityRole: 'button' })
      .filter((n) => n.props.accessibilityLabel === 'Edit Profile' || n.props.title === 'Edit Profile');
    expect(editBtns.length).toBeGreaterThan(0);
  });

  it('shows Follow button when not current user and not following', () => {
    const { tree } = render({ isCurrentUser: false, isFollowing: false });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Follow');
  });

  it('shows Following button when isFollowing is true', () => {
    const { tree } = render({ isCurrentUser: false, isFollowing: true });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Following');
  });

  it('passes the username into the avatar accessibilityLabel', () => {
    const { tree } = render();
    const label = tree.root.findByProps({ accessibilityLabel: 'Profile avatar for alice' });
    expect(label).toBeDefined();
  });

  it('renders followers/following counts as tappable stats', () => {
    const onFollowersPress = jest.fn();
    const onFollowingPress = jest.fn();
    const { tree } = render({ onFollowersPress, onFollowingPress });

    const followers = tree.root.findByProps({ accessibilityLabel: '12 Followers' });
    const following = tree.root.findByProps({ accessibilityLabel: '7 Following' });

    act(() => {
      followers.props.onPress();
      following.props.onPress();
    });
    expect(onFollowersPress).toHaveBeenCalledTimes(1);
    expect(onFollowingPress).toHaveBeenCalledTimes(1);
  });
});

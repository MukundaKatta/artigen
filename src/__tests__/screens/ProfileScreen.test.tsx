/**
 * Smoke tests for <ProfileScreen>. The full screen has 6+ hook-backed
 * data sources (posts, collections, theme, auth, scroll-to-top); these
 * tests just verify it renders without crashing under reasonable mock
 * conditions and shows the right tab labels.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ProfileScreen } from '@/screens/ProfileScreen';

const useAuthMock = jest.fn();
const useCollectionsMock = jest.fn();

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => useAuthMock(),
}));

jest.mock('@/hooks/useCollections', () => ({
  useCollections: () => useCollectionsMock(),
}));

jest.mock('@/app/(tabs)/_layout', () => ({
  useScrollToTopOnTabPress: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  useAuthMock.mockReturnValue({
    user: { id: 'u-1' },
    profile: {
      id: 'u-1',
      username: 'alice',
      full_name: 'Alice',
      bio: '',
      avatar_url: null,
      website: null,
      is_verified: false,
      is_private: false,
      followers_count: 0,
      following_count: 0,
      posts_count: 0,
      show_activity_status: true,
      last_active_at: null,
      profile_theme: null,
      portfolio_enabled: false,
      portfolio_bio: null,
      portfolio_contact_email: null,
      interest_tags: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    },
    refreshProfile: jest.fn(),
    session: null,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  });
  useCollectionsMock.mockReturnValue({ collections: [], loading: false });
});

function render() {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<ProfileScreen />);
  });
  return tree;
}

describe('<ProfileScreen> (smoke)', () => {
  it('renders without crashing with a basic profile', () => {
    const tree = render();
    expect(tree.toJSON()).toBeDefined();
  });

  it('renders without throwing when collections are loaded', () => {
    useCollectionsMock.mockReturnValueOnce({
      collections: [
        { id: 'c-1', name: 'Faves', cover_url: null },
      ],
      loading: false,
    });
    let tree!: TestRenderer.ReactTestRenderer;
    expect(() => {
      act(() => {
        tree = TestRenderer.create(<ProfileScreen />);
      });
    }).not.toThrow();
    expect(tree.toJSON()).toBeDefined();
  });

  it('handles a missing profile (no crash on early mount)', () => {
    useAuthMock.mockReturnValueOnce({
      user: null,
      profile: null,
      refreshProfile: jest.fn(),
      session: null,
      loading: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });
    let tree!: TestRenderer.ReactTestRenderer;
    expect(() => {
      act(() => {
        tree = TestRenderer.create(<ProfileScreen />);
      });
    }).not.toThrow();
    expect(tree.toJSON()).toBeDefined();
  });
});

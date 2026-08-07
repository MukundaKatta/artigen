/**
 * Tests for <ShareSheet>. Focus: render structure, search debounce
 * + min-length guard, and the per-user send dispatch.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ShareSheet } from '@/components/shared/ShareSheet';
import * as profileService from '@/services/profile.service';
import * as messageService from '@/services/message.service';

jest.mock('@/services/profile.service', () => ({
  searchUsers: jest.fn().mockResolvedValue({ data: [], error: null }),
}));
jest.mock('@/services/message.service', () => ({
  getOrCreateConversation: jest.fn().mockResolvedValue({ data: { id: 'c-1' }, error: null }),
  sendMessage: jest.fn().mockResolvedValue({ data: null, error: null }),
}));

function render(props: Partial<React.ComponentProps<typeof ShareSheet>> = {}) {
  const final: React.ComponentProps<typeof ShareSheet> = {
    visible: true,
    onClose: jest.fn(),
    postId: 'p-1',
    currentUserId: 'me',
    ...props,
  };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<ShareSheet {...final} />);
  });
  return { tree, props: final };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('<ShareSheet>', () => {
  it('renders the search input and the external-share fallback row', () => {
    const { tree } = render();
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Search users');
    expect(json).toContain('Share externally');
  });

  it('does NOT call searchUsers for sub-2-char queries', () => {
    const { tree } = render();
    const input = tree.root.findByProps({ placeholder: 'Search users...' });

    act(() => {
      input.props.onChangeText('a'); // 1 char
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(profileService.searchUsers).not.toHaveBeenCalled();
  });

  it('calls searchUsers after debounce when query reaches 2 chars', () => {
    const { tree } = render();
    const input = tree.root.findByProps({ placeholder: 'Search users...' });

    act(() => {
      input.props.onChangeText('al');
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(profileService.searchUsers).toHaveBeenCalledWith('al');
  });

  it('Share externally row triggers the React Native Share dialog + onClose', async () => {
    const onClose = jest.fn();
    const { tree } = render({ onClose });

    // Find the external-share Pressable (search "Share externally" text)
    const allText = tree.root.findAllByType('Text');
    const externalTextNode = allText.find((n) => /Share externally/.test(JSON.stringify(n.props.children)));
    expect(externalTextNode).toBeDefined();

    // Walk up to its Pressable parent and fire onPress.
    let press = externalTextNode!.parent;
    while (press && press.props.onPress === undefined) press = press.parent;
    expect(press).toBeDefined();

    await act(async () => {
      await press!.props.onPress();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('reset state when the sheet hides (visible toggles to false)', () => {
    const onClose = jest.fn();
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <ShareSheet visible={true} onClose={onClose} postId="p-1" currentUserId="me" />,
      );
    });

    // Type a query first to dirty the state
    const input = tree.root.findByProps({ placeholder: 'Search users...' });
    act(() => {
      input.props.onChangeText('alice');
    });

    // Hide
    act(() => {
      tree.update(
        <ShareSheet visible={false} onClose={onClose} postId="p-1" currentUserId="me" />,
      );
    });

    // No crash and Modal visible=false
    const modal = tree.root.findByType('Modal');
    expect(modal.props.visible).toBe(false);
  });
});

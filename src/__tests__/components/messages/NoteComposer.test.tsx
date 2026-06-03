import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { NoteComposer } from '@/components/messages/NoteComposer';

function render(props: Partial<React.ComponentProps<typeof NoteComposer>> = {}) {
  const final: React.ComponentProps<typeof NoteComposer> = {
    visible: true,
    onClose: jest.fn(),
    onShare: jest.fn().mockResolvedValue(undefined),
    ...props,
  };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<NoteComposer {...final} />);
  });
  return { tree, props: final };
}

describe('<NoteComposer>', () => {
  it('renders cancel + Share + New note header when visible', () => {
    const { tree } = render();
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Cancel');
    expect(json).toContain('Share');
    expect(json).toContain('New note');
  });

  it('Cancel button calls onClose', () => {
    const onClose = jest.fn();
    const { tree } = render({ onClose });
    const cancel = tree.root.findByProps({ accessibilityLabel: 'Cancel note' });
    act(() => {
      cancel.props.onPress();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables Share when content is empty', () => {
    const { tree } = render();
    const share = tree.root.findByProps({ accessibilityLabel: 'Share note' });
    expect(share.props.accessibilityState).toEqual({ disabled: true, busy: false });
  });

  it('enables Share once text is entered + invokes onShare with the content', async () => {
    const onShare = jest.fn().mockResolvedValue(undefined);
    const { tree } = render({ onShare });

    const ti = tree.root.findByProps({ accessibilityLabel: 'Note text' });
    act(() => {
      ti.props.onChangeText('Hello world');
    });

    const share = tree.root.findByProps({ accessibilityLabel: 'Share note' });
    expect(share.props.accessibilityState.disabled).toBe(false);

    await act(async () => {
      await share.props.onPress();
    });
    expect(onShare).toHaveBeenCalledWith('Hello world', undefined);
  });

  it('passes the selected emoji to onShare when one is chosen', async () => {
    const onShare = jest.fn().mockResolvedValue(undefined);
    const { tree } = render({ onShare });

    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Note text' }).props.onChangeText('Fire!');
    });
    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Emoji 🔥' }).props.onPress();
    });

    await act(async () => {
      await tree.root.findByProps({ accessibilityLabel: 'Share note' }).props.onPress();
    });

    expect(onShare).toHaveBeenCalledWith('Fire!', '🔥');
  });

  it('enforces the 60-char maxLength on the TextInput', () => {
    const { tree } = render();
    const ti = tree.root.findByProps({ accessibilityLabel: 'Note text' });
    expect(ti.props.maxLength).toBe(60);
  });

  it('renders the character-count Text reflecting current length', () => {
    const { tree } = render();
    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Note text' }).props.onChangeText('Hi');
    });
    const json = JSON.stringify(tree.toJSON());
    // count rendered as ["2", "/", "60"] children
    expect(json).toContain('"2"');
    expect(json).toContain('"60"');
  });
});

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ActionSheet, type ActionSheetItem } from '@/components/ui/ActionSheet';

function render(props: Partial<React.ComponentProps<typeof ActionSheet>> = {}) {
  const items: ActionSheetItem[] = [
    { label: 'Edit', onPress: jest.fn() },
    { label: 'Share', onPress: jest.fn() },
    { label: 'Delete', destructive: true, onPress: jest.fn() },
  ];
  const final: React.ComponentProps<typeof ActionSheet> = {
    visible: true,
    onClose: jest.fn(),
    items,
    ...props,
  };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<ActionSheet {...final} />);
  });
  return { tree, props: final, items };
}

describe('<ActionSheet>', () => {
  it('renders nothing when visible=false (mobile path)', () => {
    const { tree } = render({ visible: false });
    expect(tree.toJSON()).toBeNull();
  });

  it('renders each item label when visible', () => {
    const { tree } = render({ visible: true });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Edit');
    expect(json).toContain('Share');
    expect(json).toContain('Delete');
    // Plus the synthetic Cancel button
    expect(json).toContain('Cancel');
  });

  it('forwards an optional title with header role', () => {
    const { tree } = render({ title: 'Choose action' });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Choose action');
  });

  it('renders each item with role="menuitem" + label', () => {
    const { tree } = render();
    const items = tree.root.findAllByProps({ accessibilityRole: 'menuitem' });
    expect(items.length).toBeGreaterThanOrEqual(4); // 3 items + 1 Cancel (each may wrap in multiple layers)
    expect(items.map((i) => i.props.accessibilityLabel)).toEqual(
      expect.arrayContaining(['Edit', 'Share', 'Delete', 'Cancel']),
    );
  });

  it('Cancel onPress triggers the onClose callback', () => {
    const onClose = jest.fn();
    const { tree } = render({ onClose });
    const cancel = tree.root.findByProps({ accessibilityLabel: 'Cancel' });
    act(() => {
      cancel.props.onPress();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('selecting an item closes the sheet then fires the item callback (after delay)', () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    const itemPress = jest.fn();
    const items: ActionSheetItem[] = [{ label: 'Tap me', onPress: itemPress }];

    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <ActionSheet visible={true} onClose={onClose} items={items} />,
      );
    });

    const tapMe = tree.root.findByProps({ accessibilityLabel: 'Tap me' });
    act(() => {
      tapMe.props.onPress();
    });

    // onClose fires immediately
    expect(onClose).toHaveBeenCalledTimes(1);
    // Item onPress is deferred until the close animation finishes
    expect(itemPress).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(itemPress).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});

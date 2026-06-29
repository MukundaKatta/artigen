/**
 * Smoke tests for the Tag primitive.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Tag } from '@/components/ui/Tag';

function render(node: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(node);
  });
  return tree;
}

describe('Tag', () => {
  it('renders the label', () => {
    const tree = render(<Tag label="abstract" />);
    const text = tree.root.findAllByType('Text').find((t) => t.props.children === 'abstract');
    expect(text).toBeTruthy();
  });

  it('renders a remove icon when onRemove is provided', () => {
    const cb = jest.fn();
    const tree = render(<Tag label="abstract" onRemove={cb} />);
    const removeBtn = tree.root.findByProps({ accessibilityLabel: 'Remove abstract' });
    act(() => {
      removeBtn.props.onPress?.();
    });
    expect(cb).toHaveBeenCalled();
  });

  it('honours accessibilityState.selected when selected', () => {
    const tree = render(<Tag label="abstract" onPress={() => {}} selected />);
    const press = tree.root.findByProps({ accessibilityRole: 'button' });
    expect(press.props.accessibilityState).toEqual({ selected: true });
  });
});

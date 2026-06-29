/**
 * Smoke tests for the Badge / BadgeDot primitives.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Badge, BadgeDot } from '@/components/ui/Badge';

function render(node: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(node);
  });
  return tree;
}

describe('Badge', () => {
  it('renders the label verbatim', () => {
    const tree = render(<Badge label="Pro" />);
    expect(tree.root.findByType('Text').props.children).toBe('Pro');
  });

  it('caps numeric labels at 99+ when cap99 is set', () => {
    const tree = render(<Badge label={245} cap99 />);
    expect(tree.root.findByType('Text').props.children).toBe('99+');
  });

  it('does not cap when cap99 is off', () => {
    const tree = render(<Badge label={245} />);
    expect(tree.root.findByType('Text').props.children).toBe('245');
  });
});

describe('BadgeDot', () => {
  it('renders an a11y-labelled dot', () => {
    const tree = render(<BadgeDot />);
    const dot = tree.root.findByProps({ accessibilityLabel: 'Unread' });
    expect(dot).toBeTruthy();
  });
});

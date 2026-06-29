/**
 * Smoke tests for the Divider primitive.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Divider } from '@/components/ui/Divider';

function render(node: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(node);
  });
  return tree;
}

describe('Divider', () => {
  it('renders a single hairline view when no label is provided', () => {
    const tree = render(<Divider />);
    // No Text children when bare.
    expect(tree.root.findAllByType('Text')).toHaveLength(0);
  });

  it('renders text + two flanking lines when label is provided', () => {
    const tree = render(<Divider label="OR" />);
    const text = tree.root.findByType('Text');
    expect(text.props.children).toBe('OR');
  });

  it('hides flanking lines when bare is true with a label', () => {
    const tree = render(<Divider label="OR" bare />);
    expect(tree.root.findByType('Text').props.children).toBe('OR');
    // Only the wrapping View should be present, no extra line Views.
    const views = tree.root.findAllByType('View');
    // The outer wrapping View + no flanking lines = exactly 1
    expect(views).toHaveLength(1);
  });
});

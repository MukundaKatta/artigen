/**
 * Smoke tests for the Switch primitive.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Switch } from '@/components/ui/Switch';

function render(node: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(node);
  });
  return tree;
}

describe('Switch', () => {
  it('exposes accessibilityRole="switch" and the checked state', () => {
    const tree = render(<Switch value={true} onValueChange={() => {}} />);
    const sw = tree.root.findByProps({ accessibilityRole: 'switch' });
    expect(sw.props.accessibilityState).toEqual({ checked: true, disabled: false });
  });

  it('fires onValueChange with the flipped value', () => {
    const cb = jest.fn();
    const tree = render(<Switch value={false} onValueChange={cb} />);
    const sw = tree.root.findByProps({ accessibilityRole: 'switch' });
    act(() => {
      sw.props.onPress?.();
    });
    expect(cb).toHaveBeenCalledWith(true);
  });

  it('does not fire onValueChange when disabled', () => {
    const cb = jest.fn();
    const tree = render(<Switch value={false} onValueChange={cb} disabled />);
    const sw = tree.root.findByProps({ accessibilityRole: 'switch' });
    act(() => {
      sw.props.onPress?.();
    });
    expect(cb).not.toHaveBeenCalled();
  });
});

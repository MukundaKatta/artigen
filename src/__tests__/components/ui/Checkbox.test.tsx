/**
 * Smoke tests for the Checkbox primitive.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Checkbox } from '@/components/ui/Checkbox';

function render(node: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(node);
  });
  return tree;
}

describe('Checkbox', () => {
  it('renders as accessibilityRole="checkbox"', () => {
    const tree = render(<Checkbox value={false} onValueChange={() => {}} />);
    const cb = tree.root.findByProps({ accessibilityRole: 'checkbox' });
    expect(cb).toBeTruthy();
  });

  it('flips value on press', () => {
    const cb = jest.fn();
    const tree = render(<Checkbox value={false} onValueChange={cb} label="terms" />);
    const press = tree.root.findByProps({ accessibilityLabel: 'terms' });
    act(() => {
      press.props.onPress?.();
    });
    expect(cb).toHaveBeenCalledWith(true);
  });

  it('does not fire when disabled', () => {
    const cb = jest.fn();
    const tree = render(<Checkbox value={false} onValueChange={cb} label="x" disabled />);
    const press = tree.root.findByProps({ accessibilityLabel: 'x' });
    act(() => {
      press.props.onPress?.();
    });
    expect(cb).not.toHaveBeenCalled();
  });
});

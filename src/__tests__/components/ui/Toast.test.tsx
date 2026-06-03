import React from 'react';
import TestRenderer, { type ReactTestRenderer, act } from 'react-test-renderer';
import { ToastContainer, showToast } from '@/components/ui/Toast';

function render() {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<ToastContainer />);
  });
  return tree;
}

describe('<ToastContainer>', () => {
  it('renders nothing initially (no toast in queue)', () => {
    const tree = render();
    expect(tree.toJSON()).toBeNull();
  });

  it('renders a toast when showToast() fires a message', () => {
    const tree = render();
    act(() => {
      showToast({ message: 'Hello there', type: 'info' });
    });
    // The container Animated.View has accessibilityLabel `${type}: ${message}`
    const visible = tree.root.findAllByProps({ accessibilityLabel: 'info: Hello there' });
    expect(visible.length).toBeGreaterThan(0);
  });

  it('applies role=alert and liveRegion=assertive for error toasts', () => {
    const tree = render();
    act(() => {
      showToast({ message: 'Boom', type: 'error' });
    });
    const node = tree.root.findByProps({ accessibilityLabel: 'error: Boom' });
    expect(node.props.accessibilityRole).toBe('alert');
    expect(node.props.accessibilityLiveRegion).toBe('assertive');
  });

  it('uses liveRegion=polite for non-error toasts', () => {
    const tree = render();
    act(() => {
      showToast({ message: 'Saved', type: 'success' });
    });
    const node = tree.root.findByProps({ accessibilityLabel: 'success: Saved' });
    expect(node.props.accessibilityRole).toBeUndefined();
    expect(node.props.accessibilityLiveRegion).toBe('polite');
  });
});

/**
 * Render tests for <ErrorBoundary>. Verifies it catches a thrown render
 * error, displays the recovery UI, calls the onError callback, and resets
 * state when "Try Again" is pressed.
 *
 * Note: React's error boundary intentionally logs to console.error when a
 * child throws — we silence that for the duration of the throwing tests.
 */

import React from 'react';
import TestRenderer, { type ReactTestRenderer } from 'react-test-renderer';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

function Crash(): React.ReactElement {
  throw new Error('boom');
}

function Ok(): React.ReactElement {
  return <></>;
}

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  (console.error as jest.Mock).mockRestore?.();
});

describe('<ErrorBoundary>', () => {
  it('renders children when there is no error', () => {
    let tree!: ReactTestRenderer;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <ErrorBoundary>
          <Ok />
        </ErrorBoundary>,
      );
    });
    // No recovery UI rendered
    const recovery = tree.root.findAllByProps({ accessibilityLabel: 'Try again' });
    expect(recovery).toHaveLength(0);
  });

  it('displays the fallback UI when a child throws', () => {
    let tree!: ReactTestRenderer;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <ErrorBoundary>
          <Crash />
        </ErrorBoundary>,
      );
    });
    const tryAgain = tree.root.findByProps({ accessibilityLabel: 'Try again' });
    const goHome = tree.root.findByProps({ accessibilityLabel: 'Go to home screen' });
    expect(tryAgain).toBeDefined();
    expect(goHome).toBeDefined();
  });

  it('invokes the onError callback with the thrown error', () => {
    const onError = jest.fn();
    TestRenderer.act(() => {
      TestRenderer.create(
        <ErrorBoundary onError={onError}>
          <Crash />
        </ErrorBoundary>,
      );
    });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe('boom');
  });

  it('renders an explicit `fallback` prop instead of the default UI when provided', () => {
    let tree!: ReactTestRenderer;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <ErrorBoundary fallback={<></>}>
          <Crash />
        </ErrorBoundary>,
      );
    });
    // No default-UI buttons
    const tryAgain = tree.root.findAllByProps({ accessibilityLabel: 'Try again' });
    expect(tryAgain).toHaveLength(0);
  });

  it('Try Again resets hasError so children render again on next pass', () => {
    let renderCount = 0;
    function Toggling(): React.ReactElement {
      renderCount += 1;
      if (renderCount === 1) throw new Error('first');
      return <></>;
    }

    let tree!: ReactTestRenderer;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <ErrorBoundary>
          <Toggling />
        </ErrorBoundary>,
      );
    });

    const tryAgain = tree.root.findByProps({ accessibilityLabel: 'Try again' });
    TestRenderer.act(() => {
      tryAgain.props.onPress();
    });

    // After reset, the recovery UI is gone (children rendered successfully on retry)
    const after = tree.root.findAllByProps({ accessibilityLabel: 'Try again' });
    expect(after).toHaveLength(0);
  });
});

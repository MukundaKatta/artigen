/**
 * Tests for useDebounce, useDebouncedCallback, useThrottledCallback —
 * the timing utilities used throughout the app for search inputs,
 * scroll handlers, and resize events.
 *
 * Uses a host component + react-test-renderer to actually invoke the
 * hooks (the bare-hook path requires @testing-library/react-hooks).
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useDebounce, useDebouncedCallback, useThrottledCallback } from '@/hooks/useDebounce';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useDebounce(value)', () => {
  function Probe({ value, delay }: { value: string; delay?: number }) {
    const debounced = useDebounce(value, delay);
    return React.createElement('Text', { 'data-debounced': debounced }, debounced);
  }

  it('returns initial value immediately', () => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<Probe value="hello" delay={300} />);
    });
    const node = tree.root.findByType('Text');
    expect(node.props['data-debounced']).toBe('hello');
  });

  it('updates only after delay elapses', () => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<Probe value="a" delay={300} />);
    });

    act(() => {
      tree.update(<Probe value="b" delay={300} />);
    });

    // Before the timer fires, the debounced value is still the old one.
    expect(tree.root.findByType('Text').props['data-debounced']).toBe('a');

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(tree.root.findByType('Text').props['data-debounced']).toBe('a');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(tree.root.findByType('Text').props['data-debounced']).toBe('b');
  });

  it('rapid changes coalesce — only the final value is emitted', () => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<Probe value="a" delay={300} />);
    });

    act(() => {
      tree.update(<Probe value="b" delay={300} />);
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    act(() => {
      tree.update(<Probe value="c" delay={300} />);
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    act(() => {
      tree.update(<Probe value="d" delay={300} />);
    });

    // Only after another full delay does it settle.
    expect(tree.root.findByType('Text').props['data-debounced']).toBe('a');
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(tree.root.findByType('Text').props['data-debounced']).toBe('d');
  });

  it('defaults to 300ms when no delay is provided', () => {
    function ProbeDefault({ value }: { value: string }) {
      const debounced = useDebounce(value);
      return React.createElement('Text', { 'data-debounced': debounced }, debounced);
    }

    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<ProbeDefault value="x" />);
    });
    act(() => {
      tree.update(<ProbeDefault value="y" />);
    });

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(tree.root.findByType('Text').props['data-debounced']).toBe('x');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(tree.root.findByType('Text').props['data-debounced']).toBe('y');
  });
});

describe('useDebouncedCallback', () => {
  function Probe({
    onFire,
    delay,
    spy,
  }: {
    onFire: (n: number) => void;
    delay?: number;
    spy: (cb: (n: number) => void) => void;
  }) {
    const debounced = useDebouncedCallback(onFire, delay);
    spy(debounced);
    return null;
  }

  it('fires only once after a burst of calls', () => {
    const cb = jest.fn();
    let debounced!: (n: number) => void;
    act(() => {
      TestRenderer.create(
        <Probe onFire={cb} delay={200} spy={(d) => (debounced = d)} />,
      );
    });

    act(() => {
      debounced(1);
      debounced(2);
      debounced(3);
    });

    expect(cb).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(3);
  });

  it('separates calls that are spaced beyond the delay', () => {
    const cb = jest.fn();
    let debounced!: (n: number) => void;
    act(() => {
      TestRenderer.create(
        <Probe onFire={cb} delay={100} spy={(d) => (debounced = d)} />,
      );
    });

    act(() => {
      debounced(1);
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      debounced(2);
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenNthCalledWith(1, 1);
    expect(cb).toHaveBeenNthCalledWith(2, 2);
  });
});

describe('useThrottledCallback', () => {
  function Probe({
    onFire,
    interval,
    spy,
  }: {
    onFire: (n: number) => void;
    interval?: number;
    spy: (cb: (n: number) => void) => void;
  }) {
    const throttled = useThrottledCallback(onFire, interval);
    spy(throttled);
    return null;
  }

  it('first call fires immediately', () => {
    const cb = jest.fn();
    let throttled!: (n: number) => void;
    act(() => {
      TestRenderer.create(
        <Probe onFire={cb} interval={100} spy={(d) => (throttled = d)} />,
      );
    });

    act(() => {
      throttled(1);
    });

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(1);
  });

  it('coalesces a rapid burst — leading call fires, first trailing call wins', () => {
    const cb = jest.fn();
    let throttled!: (n: number) => void;
    act(() => {
      TestRenderer.create(
        <Probe onFire={cb} interval={100} spy={(d) => (throttled = d)} />,
      );
    });

    act(() => {
      throttled(1); // leading edge — fires immediately
      throttled(2); // suppressed, scheduled for trailing edge with these args
      throttled(3); // suppressed; timer already pending, args from (2) are kept
    });

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(1);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // The current implementation captures args from the first suppressed
    // call, not the most recent — verify that behavior is preserved.
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenNthCalledWith(2, 2);
  });

  it('calls separated beyond the interval all fire immediately', () => {
    const cb = jest.fn();
    let throttled!: (n: number) => void;
    act(() => {
      TestRenderer.create(
        <Probe onFire={cb} interval={50} spy={(d) => (throttled = d)} />,
      );
    });

    act(() => {
      throttled(1);
    });
    act(() => {
      jest.advanceTimersByTime(60);
    });
    act(() => {
      throttled(2);
    });
    act(() => {
      jest.advanceTimersByTime(60);
    });
    act(() => {
      throttled(3);
    });

    expect(cb).toHaveBeenCalledTimes(3);
    expect(cb).toHaveBeenNthCalledWith(1, 1);
    expect(cb).toHaveBeenNthCalledWith(2, 2);
    expect(cb).toHaveBeenNthCalledWith(3, 3);
  });
});

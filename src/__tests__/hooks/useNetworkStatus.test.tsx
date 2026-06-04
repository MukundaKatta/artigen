/**
 * Tests for useNetworkStatus — the connectivity hook used by the offline
 * banner and the queued-mutations system.
 *
 * On native (default mock Platform.OS = 'ios'), the hook short-circuits
 * and reports online without subscribing to anything. On web, it reads
 * navigator.onLine and listens for online/offline events.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Platform } from 'react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

afterEach(() => {
  Platform.OS = 'ios';
  delete (globalThis as any).navigator;
  delete (globalThis as any).window;
  jest.useRealTimers();
});

function renderHook() {
  let captured!: ReturnType<typeof useNetworkStatus>;
  function Probe() {
    captured = useNetworkStatus();
    return null;
  }
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<Probe />);
  });
  return { get: () => captured, tree };
}

describe('useNetworkStatus on native', () => {
  it('assumes online and is not reconnecting', () => {
    Platform.OS = 'ios';
    const { get } = renderHook();
    expect(get().isOnline).toBe(true);
    expect(get().isReconnecting).toBe(false);
  });

  it('does not attach window listeners on native', () => {
    Platform.OS = 'ios';
    // Even if a fake window is present, the hook should not bind to it.
    const addSpy = jest.fn();
    (globalThis as any).window = { addEventListener: addSpy, removeEventListener: jest.fn() };
    renderHook();
    expect(addSpy).not.toHaveBeenCalled();
  });
});

describe('useNetworkStatus on web', () => {
  beforeEach(() => {
    Platform.OS = 'web';
    jest.useFakeTimers();
  });

  function setupWindow(initialOnline: boolean) {
    const listeners: Record<string, Array<() => void>> = {};
    const win = {
      addEventListener: (event: string, cb: () => void) => {
        (listeners[event] ||= []).push(cb);
      },
      removeEventListener: (event: string, cb: () => void) => {
        listeners[event] = (listeners[event] || []).filter((l) => l !== cb);
      },
    };
    (globalThis as any).window = win;
    (globalThis as any).navigator = { onLine: initialOnline };
    return {
      fire(event: string) {
        for (const cb of listeners[event] || []) cb();
      },
      listenerCount(event: string) {
        return (listeners[event] || []).length;
      },
    };
  }

  it('initialises from navigator.onLine', () => {
    setupWindow(false);
    const { get } = renderHook();
    expect(get().isOnline).toBe(false);
  });

  it('attaches online + offline listeners on mount', () => {
    const handle = setupWindow(true);
    renderHook();
    expect(handle.listenerCount('online')).toBe(1);
    expect(handle.listenerCount('offline')).toBe(1);
  });

  it('detaches listeners on unmount', () => {
    const handle = setupWindow(true);
    const { tree } = renderHook();
    act(() => {
      tree.unmount();
    });
    expect(handle.listenerCount('online')).toBe(0);
    expect(handle.listenerCount('offline')).toBe(0);
  });

  it('offline event flips isOnline → false', () => {
    const handle = setupWindow(true);
    const { get } = renderHook();
    expect(get().isOnline).toBe(true);

    act(() => {
      handle.fire('offline');
    });

    expect(get().isOnline).toBe(false);
    expect(get().isReconnecting).toBe(false);
  });

  it('online event flips isOnline → true and shows a brief reconnecting state', () => {
    const handle = setupWindow(false);
    const { get } = renderHook();
    expect(get().isOnline).toBe(false);

    act(() => {
      handle.fire('online');
    });

    expect(get().isOnline).toBe(true);
    expect(get().isReconnecting).toBe(true);

    // The reconnecting flag clears after the 2-second display window.
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(get().isReconnecting).toBe(false);
    expect(get().isOnline).toBe(true);
  });
});

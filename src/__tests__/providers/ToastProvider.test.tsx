import React, { useEffect } from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ToastProvider, useToastContext } from '@/providers/ToastProvider';
import { useToast } from '@/hooks/useToast';

function Spy({ onContext }: { onContext: (ctx: ReturnType<typeof useToastContext>) => void }) {
  const ctx = useToastContext();
  useEffect(() => {
    onContext(ctx);
  });
  return null;
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('<ToastProvider>', () => {
  it('mounts a ToastContainer alongside its children', async () => {
    let tree!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(
        <ToastProvider>
          <></>
        </ToastProvider>,
      );
    });
    // ToastContainer renders null initially (no toasts), so the tree is the
    // children fragment + the (null) container — i.e. no crash on mount.
    expect(tree.toJSON()).toBeDefined();
  });

  it('exposes show / success / error / info / warning / dismiss via context', async () => {
    let captured: ReturnType<typeof useToastContext> | null = null;
    await act(async () => {
      TestRenderer.create(
        <ToastProvider>
          <Spy onContext={(c) => { captured = c; }} />
        </ToastProvider>,
      );
    });

    expect(typeof captured!.show).toBe('function');
    expect(typeof captured!.success).toBe('function');
    expect(typeof captured!.error).toBe('function');
    expect(typeof captured!.info).toBe('function');
    expect(typeof captured!.warning).toBe('function');
    expect(typeof captured!.dismiss).toBe('function');
  });

  it('useToastContext throws when used outside a provider', () => {
    expect(() => {
      // Render a Spy without a wrapping provider — error during render.
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      try {
        TestRenderer.create(<Spy onContext={() => {}} />);
      } finally {
        errSpy.mockRestore();
      }
    }).toThrow('useToastContext must be used within a ToastProvider');
  });
});

describe('useToast hook (queue + auto-dismiss)', () => {
  function renderHook() {
    let captured: ReturnType<typeof useToast> | null = null;
    function Probe() {
      captured = useToast();
      return null;
    }
    TestRenderer.create(<Probe />);
    return () => captured!;
  }

  it('show() returns an id and adds the toast to the queue', () => {
    const get = renderHook();
    act(() => {
      get().show('hello');
    });
    expect(get().toasts).toHaveLength(1);
    expect(get().toasts[0].message).toBe('hello');
    expect(get().toasts[0].type).toBe('info');
  });

  it('caps the queue at 5 toasts (oldest evicted)', () => {
    const get = renderHook();
    act(() => {
      for (let i = 0; i < 7; i++) get().show(`m-${i}`);
    });
    expect(get().toasts).toHaveLength(5);
    expect(get().toasts[0].message).toBe('m-2'); // earliest two evicted
    expect(get().toasts[4].message).toBe('m-6');
  });

  it('error() uses a 5s default duration', () => {
    const get = renderHook();
    let id: string;
    act(() => {
      id = get().error('oops');
    });
    const toast = get().toasts.find((t) => t.id === id!);
    expect(toast?.duration).toBe(5000);
    expect(toast?.type).toBe('error');
  });

  it('warning() uses a 4s default duration', () => {
    const get = renderHook();
    act(() => {
      get().warning('careful');
    });
    expect(get().toasts.at(-1)?.duration).toBe(4000);
  });

  it('auto-dismisses after duration elapses', () => {
    const get = renderHook();
    act(() => {
      get().show('temp', { duration: 1000 });
    });
    expect(get().toasts).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(get().toasts).toHaveLength(0);
  });
});

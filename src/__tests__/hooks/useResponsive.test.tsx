/**
 * Tests for useResponsive — the breakpoint hook used to switch between
 * mobile / tablet / desktop layouts.
 *
 * On native (mock default Platform.OS = 'ios'), the hook reads from
 * Dimensions.get('window'). We override that getter per-test to simulate
 * different viewport sizes without needing real window events.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Dimensions, Platform } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';

const originalGet = Dimensions.get;

afterEach(() => {
  Dimensions.get = originalGet;
  Platform.OS = 'ios';
});

function setViewport(width: number, height = 800) {
  Dimensions.get = jest.fn().mockReturnValue({ width, height, scale: 1, fontScale: 1 }) as any;
}

function renderHook() {
  let captured!: ReturnType<typeof useResponsive>;
  function Probe() {
    captured = useResponsive();
    return null;
  }
  act(() => {
    TestRenderer.create(<Probe />);
  });
  return () => captured;
}

describe('useResponsive — breakpoint detection', () => {
  it('classifies a 375-wide viewport as mobile', () => {
    Platform.OS = 'ios';
    setViewport(375);
    const get = renderHook();
    const info = get();
    expect(info.breakpoint).toBe('mobile');
    expect(info.isMobile).toBe(true);
    expect(info.isTablet).toBe(false);
    expect(info.isDesktop).toBe(false);
  });

  it('classifies a 768-wide viewport as tablet', () => {
    Platform.OS = 'ios';
    setViewport(768);
    const get = renderHook();
    const info = get();
    expect(info.breakpoint).toBe('tablet');
    expect(info.isTablet).toBe(true);
    expect(info.isMobile).toBe(false);
    expect(info.isDesktop).toBe(false);
  });

  it('classifies a 1024-wide viewport as desktop', () => {
    Platform.OS = 'ios';
    setViewport(1024);
    const get = renderHook();
    const info = get();
    expect(info.breakpoint).toBe('desktop');
    expect(info.isDesktop).toBe(true);
    expect(info.isTablet).toBe(false);
    expect(info.isMobile).toBe(false);
  });

  it('classifies a 1440-wide viewport as desktop', () => {
    Platform.OS = 'ios';
    setViewport(1440, 900);
    const get = renderHook();
    const info = get();
    expect(info.breakpoint).toBe('desktop');
    expect(info.width).toBe(1440);
    expect(info.height).toBe(900);
  });

  it('boundary: 767 is still mobile, 768 is tablet', () => {
    Platform.OS = 'ios';

    setViewport(767);
    expect(renderHook()().breakpoint).toBe('mobile');

    setViewport(768);
    expect(renderHook()().breakpoint).toBe('tablet');
  });

  it('boundary: 1023 is still tablet, 1024 is desktop', () => {
    Platform.OS = 'ios';

    setViewport(1023);
    expect(renderHook()().breakpoint).toBe('tablet');

    setViewport(1024);
    expect(renderHook()().breakpoint).toBe('desktop');
  });
});

describe('useResponsive — dimension passthrough', () => {
  it('returns the source width and height verbatim', () => {
    Platform.OS = 'ios';
    setViewport(414, 896);
    const info = renderHook()();
    expect(info.width).toBe(414);
    expect(info.height).toBe(896);
  });
});

describe('useResponsive — booleans are mutually exclusive', () => {
  it('exactly one of isMobile / isTablet / isDesktop is true', () => {
    Platform.OS = 'ios';

    for (const w of [320, 414, 768, 900, 1024, 1440]) {
      setViewport(w);
      const info = renderHook()();
      const trueCount = [info.isMobile, info.isTablet, info.isDesktop].filter(Boolean).length;
      expect(trueCount).toBe(1);
    }
  });
});

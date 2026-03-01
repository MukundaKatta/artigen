import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import { BREAKPOINTS } from '@/lib/constants';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

type ResponsiveInfo = {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}

function getInfo(width: number, height: number): ResponsiveInfo {
  const breakpoint = getBreakpoint(width);
  return {
    width,
    height,
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
  };
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = Dimensions.get('window');
  const [info, setInfo] = useState<ResponsiveInfo>(() => getInfo(width, height));

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setInfo(getInfo(window.width, window.height));
    });

    return () => subscription.remove();
  }, []);

  return info;
}

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

function getWebDimensions(): { width: number; height: number } {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  return Dimensions.get('window');
}

export function useResponsive(): ResponsiveInfo {
  const [info, setInfo] = useState<ResponsiveInfo>(() => {
    const { width, height } = getWebDimensions();
    return getInfo(width, height);
  });

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleResize = () => {
      setInfo(getInfo(window.innerWidth, window.innerHeight));
    };

    const handleOrientation = () => {
      // Delay slightly to let the browser settle after rotation
      setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientation);

    // Run once immediately in case dimensions changed before mount
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientation);
    };
  }, []);

  return info;
}

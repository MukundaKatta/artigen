import { useCallback } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { useEffect, useState } from 'react';

/**
 * Hook that provides accessibility utilities:
 * - Screen reader detection
 * - Reduce motion preference
 * - Announcements for dynamic content
 */
export function useAccessibility() {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReduceMotionEnabled);

    const screenReaderSub = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled,
    );
    const reduceMotionSub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduceMotionEnabled,
    );

    return () => {
      screenReaderSub.remove();
      reduceMotionSub.remove();
    };
  }, []);

  const announce = useCallback((message: string) => {
    if (Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, []);

  /** Returns animation duration, respecting reduce motion preference */
  const getAnimationDuration = useCallback(
    (normalDuration: number) => {
      return isReduceMotionEnabled ? 0 : normalDuration;
    },
    [isReduceMotionEnabled],
  );

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    announce,
    getAnimationDuration,
  };
}

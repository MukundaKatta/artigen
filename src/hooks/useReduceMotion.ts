import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Hook to respect the system's "Reduce Motion" accessibility setting.
 * When enabled, animations should be simplified or disabled.
 *
 * Usage:
 *   const reduceMotion = useReduceMotion();
 *   entering={reduceMotion ? undefined : FadeInUp.duration(400)}
 */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}

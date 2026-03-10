import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, AppState } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

/**
 * Persistent banner that shows when the device loses network connectivity.
 * Animates in from top when offline, auto-hides when back online.
 * Uses a lightweight fetch-based check (no extra dependencies).
 */
export function NetworkStatusBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-60);
  const checkInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lightweight connectivity check
  const checkConnectivity = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch('https://clients3.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const runCheck = async () => {
      const online = await checkConnectivity();
      if (!mounted) return;

      if (!online && !isOffline) {
        setIsOffline(true);
        setShowBanner(true);
        translateY.value = withTiming(0, { duration: 300 });
      } else if (online && isOffline) {
        // Show "Back online" briefly then hide
        setIsOffline(false);
        translateY.value = withDelay(
          2000,
          withTiming(-60, { duration: 300 }, () => {
            runOnJS(setShowBanner)(false);
          }),
        );
      }
    };

    // Check on mount and periodically
    runCheck();
    checkInterval.current = setInterval(runCheck, 10000);

    // Also check when app comes back to foreground
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') runCheck();
    });

    return () => {
      mounted = false;
      if (checkInterval.current) clearInterval(checkInterval.current);
      subscription.remove();
    };
  }, [isOffline, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!showBanner) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.xs },
        isOffline ? styles.offline : styles.online,
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <Ionicons
        name={isOffline ? 'cloud-offline-outline' : 'checkmark-circle-outline'}
        size={16}
        color="#fff"
      />
      <Text style={styles.text}>
        {isOffline ? 'No internet connection' : 'Back online'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9998,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  offline: {
    backgroundColor: colors.error,
  },
  online: {
    backgroundColor: colors.success,
  },
  text: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
  },
});

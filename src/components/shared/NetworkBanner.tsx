import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

// Explicit (currently empty) props contract so future additions are typed
// and callers get autocomplete (#218).
export type NetworkBannerProps = Record<string, never>;

/**
 * Banner that appears when the device loses internet connectivity.
 * Automatically shows/hides based on network status.
 */
export function NetworkBanner(_: NetworkBannerProps = {}) {
  const { isOnline, isReconnecting } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  if (isOnline && !isReconnecting) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(300)}
      style={[
        styles.banner,
        { paddingTop: insets.top + spacing.xs },
        isReconnecting ? styles.reconnecting : styles.offline,
      ]}
    >
      <Ionicons
        name={isReconnecting ? 'wifi' : 'cloud-offline'}
        size={16}
        color={colors.textLight}
      />
      <Text style={styles.text}>
        {isReconnecting ? 'Reconnecting...' : 'No internet connection'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  offline: {
    backgroundColor: colors.error,
  },
  reconnecting: {
    backgroundColor: colors.warning,
  },
  text: {
    color: colors.textLight,
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
  },
});

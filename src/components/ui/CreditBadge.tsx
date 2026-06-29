import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useAuth } from '@/providers/AuthProvider';
import { getUserCredits } from '@/services/credits.service';
import {
  colors,
  fontSize,
  typography,
  borderRadius,
  spacing,
  hitSlop,
  animation,
  shadows,
} from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';
import { logger } from '@/lib/logger';

// Explicit (currently empty) props contract — #218.
export type CreditBadgeProps = Record<string, never>;

// How often we re-fetch the credit balance while the badge is mounted.
const CREDIT_REFRESH_INTERVAL_MS = 30_000;

export function CreditBadge(_: CreditBadgeProps = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);
  const lastSeen = useRef<number | null>(null);
  const scale = useSharedValue(1);
  const sparkleOpacity = useSharedValue(0);

  const fetchCredits = useCallback(async () => {
    if (!user?.id) return;
    try {
      const balance = await getUserCredits(user.id);
      setCredits(balance);
      // Pop animation + haptic on increment
      if (lastSeen.current != null && balance > lastSeen.current) {
        scale.value = withSequence(
          withSpring(1.15, animation.spring.snappy),
          withSpring(1, animation.spring.gentle),
        );
        sparkleOpacity.value = withSequence(
          withTiming(1, { duration: animation.duration.fast }),
          withTiming(0, { duration: animation.duration.normal }),
        );
        if (Platform.OS !== 'web')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      lastSeen.current = balance;
    } catch (err) {
      logger.warn('CreditBadge: failed to fetch credits', err);
    }
  }, [user?.id, scale, sparkleOpacity]);

  useEffect(() => {
    fetchCredits();
    const interval = setInterval(fetchCredits, CREDIT_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchCredits]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const sparkleStyle = useAnimatedStyle(() => ({ opacity: sparkleOpacity.value }));

  if (credits === null) return null;

  const tone = credits < 20 ? styles.lowBadge : credits === 0 ? styles.outBadge : styles.badge;
  const iconColor = credits < 20 ? colors.error : colors.warning;
  const a11yLabel =
    credits === 0
      ? 'No credits remaining. Tap to buy more.'
      : `${credits} credits. Tap to buy more.`;

  return (
    <Animated.View style={animatedStyle}>
      <AnimatedPressable
        style={[tone, shadows.sm] as any}
        onPress={() => router.push('/(screens)/buy-credits')}
        scaleValue={0.95}
        hitSlop={hitSlop.md}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
      >
        <Ionicons name="flash" size={14} color={iconColor} />
        <Text style={styles.text}>{formatNumber(credits)}</Text>
        <Animated.View style={[styles.sparkle, sparkleStyle]} pointerEvents="none">
          <Ionicons name="sparkles" size={10} color={colors.warning} />
        </Animated.View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const baseBadge = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 3,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: borderRadius.full,
  borderWidth: 1,
};

const styles = StyleSheet.create({
  badge: {
    ...baseBadge,
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
  },
  lowBadge: {
    ...baseBadge,
    backgroundColor: 'rgba(255, 187, 0, 0.12)',
    borderColor: 'rgba(255, 187, 0, 0.4)',
  },
  outBadge: {
    ...baseBadge,
    backgroundColor: 'rgba(237, 73, 86, 0.10)',
    borderColor: 'rgba(237, 73, 86, 0.40)',
  },
  text: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  sparkle: {
    position: 'absolute',
    top: -6,
    right: -2,
  },
});

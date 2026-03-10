import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { CreditToastData } from '@/hooks/useEngagementCredits';

type Props = {
  toast: CreditToastData | null;
  onDismiss: () => void;
};

export function EngagementRewardToast({ toast, onDismiss }: Props) {
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (toast) {
      // Slide up from bottom
      translateY.value = withSpring(0, { damping: 12, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });

      // Fade out after 2 seconds
      translateY.value = withDelay(
        2000,
        withTiming(100, { duration: 300 }),
      );
      opacity.value = withDelay(
        2000,
        withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(onDismiss)();
          }
        }),
      );
    } else {
      // Reset to hidden position
      translateY.value = 100;
      opacity.value = 0;
    }
  }, [toast, translateY, opacity, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!toast) return null;

  const creditText =
    toast.amount % 1 === 0 ? `+${toast.amount}` : `+${toast.amount.toFixed(1)}`;

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      accessibilityRole="alert"
      accessibilityLabel={`Earned ${toast.amount} credits for ${toast.label}`}
    >
      <Ionicons name="sparkles" size={18} color={colors.accent} />
      <Text style={styles.credits}>{creditText}</Text>
      <Text style={styles.label}>{toast.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  credits: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    color: colors.accent,
  },
  label: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.textLight,
  },
});

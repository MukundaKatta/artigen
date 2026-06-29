import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, typography, animation, borderRadius } from '@/lib/theme';

const DOT_PULSE_DURATION_MS = animation.duration.slow;
const DOT_STAGGER_MS = 150;

type Props = {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
  /** Optional caption shown below the dots. */
  caption?: string;
};

function PulsingDots({
  color = colors.textSecondary,
  size = 8,
}: {
  color?: string;
  size?: number;
}) {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const config = { duration: DOT_PULSE_DURATION_MS, easing: Easing.inOut(Easing.ease) };
    dot1.value = withRepeat(withTiming(1, config), -1, true);
    dot2.value = withDelay(DOT_STAGGER_MS, withRepeat(withTiming(1, config), -1, true));
    dot3.value = withDelay(DOT_STAGGER_MS * 2, withRepeat(withTiming(1, config), -1, true));
  }, [dot1, dot2, dot3]);

  const s1 = useAnimatedStyle(() => ({
    opacity: dot1.value,
    transform: [{ scale: 0.7 + dot1.value * 0.3 }],
  }));
  const s2 = useAnimatedStyle(() => ({
    opacity: dot2.value,
    transform: [{ scale: 0.7 + dot2.value * 0.3 }],
  }));
  const s3 = useAnimatedStyle(() => ({
    opacity: dot3.value,
    transform: [{ scale: 0.7 + dot3.value * 0.3 }],
  }));

  return (
    <View style={styles.dotsRow} accessibilityRole="progressbar" accessibilityLabel="Loading">
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
          s1,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
          s2,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
          s3,
        ]}
      />
    </View>
  );
}

export function LoadingSpinner({
  size = 'large',
  color = colors.textSecondary,
  fullScreen = false,
  caption,
}: Props) {
  const dotSize = size === 'small' ? 6 : 8;

  if (fullScreen) {
    return (
      <View style={styles.fullScreen} accessibilityRole="progressbar">
        <PulsingDots color={color} size={dotSize} />
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PulsingDots color={color} size={dotSize} />
      {caption ? <Text style={styles.captionInline}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    backgroundColor: colors.textSecondary,
    borderRadius: borderRadius.full,
  },
  caption: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  captionInline: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
});

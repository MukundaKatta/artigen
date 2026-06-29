import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, typography, borderRadius, animation } from '@/lib/theme';

type Props = {
  /** 0..1 — clamped automatically. If undefined, renders indeterminate. */
  value?: number;
  caption?: string;
  /** "sm" 4px / "md" 6px / "lg" 10px track. */
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
};

const SIZE_PX: Record<NonNullable<Props['size']>, number> = {
  sm: 4,
  md: 6,
  lg: 10,
};

export function ProgressBar({
  value,
  caption,
  size = 'md',
  color = colors.primary,
  trackColor = colors.border,
  style,
}: Props) {
  const indeterminate = value == null;
  const clamped = value == null ? 0 : Math.max(0, Math.min(1, value));
  const offset = useSharedValue(-30);

  useEffect(() => {
    if (!indeterminate) return;
    offset.value = withRepeat(
      withTiming(130, { duration: animation.duration.crawl, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [indeterminate, offset]);

  const indeterminateStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const height = SIZE_PX[size];
  const pct = Math.round(clamped * 100);

  return (
    <View
      style={[style]}
      accessibilityRole="progressbar"
      accessibilityValue={indeterminate ? undefined : { min: 0, max: 100, now: pct }}
      accessibilityLabel={caption ?? (indeterminate ? 'Loading' : `${pct} percent`)}
    >
      <View
        style={[styles.track, { height, borderRadius: height / 2, backgroundColor: trackColor }]}
      >
        {indeterminate ? (
          <Animated.View
            style={[
              styles.fill,
              styles.indeterminate,
              { backgroundColor: color, height, borderRadius: height / 2 },
              indeterminateStyle,
            ]}
          />
        ) : (
          <View
            style={[
              styles.fill,
              {
                backgroundColor: color,
                width: `${pct}%`,
                height,
                borderRadius: height / 2,
              },
            ]}
          />
        )}
      </View>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  indeterminate: {
    width: '40%',
  },
  caption: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
});

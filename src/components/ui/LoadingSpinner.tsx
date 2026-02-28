import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/lib/theme';

type Props = {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
};

function PulsingDots({ color = colors.textSecondary }: { color?: string }) {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const config = { duration: 500, easing: Easing.inOut(Easing.ease) };
    dot1.value = withRepeat(withTiming(1, config), -1, true);
    dot2.value = withDelay(150, withRepeat(withTiming(1, config), -1, true));
    dot3.value = withDelay(300, withRepeat(withTiming(1, config), -1, true));
  }, [dot1, dot2, dot3]);

  const s1 = useAnimatedStyle(() => ({ opacity: dot1.value, transform: [{ scale: 0.7 + dot1.value * 0.3 }] }));
  const s2 = useAnimatedStyle(() => ({ opacity: dot2.value, transform: [{ scale: 0.7 + dot2.value * 0.3 }] }));
  const s3 = useAnimatedStyle(() => ({ opacity: dot3.value, transform: [{ scale: 0.7 + dot3.value * 0.3 }] }));

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.dot, { backgroundColor: color }, s1]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, s2]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, s3]} />
    </View>
  );
}

export function LoadingSpinner({
  size = 'large',
  color = colors.textSecondary,
  fullScreen = false,
}: Props) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <PulsingDots color={color} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PulsingDots color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/lib/theme';

type Props = {
  size?: number;
  color?: string;
  /** Width of the arc relative to the circle (px). */
  thickness?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Continuous-spin loading ring. Lighter than the 3-dot
 * `LoadingSpinner` for inline use (input adornment, button overlay).
 */
export function Spinner({ size = 18, color = colors.primary, thickness = 2, style }: Props) {
  const angle = useSharedValue(0);

  useEffect(() => {
    angle.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false);
  }, [angle]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ rotate: `${angle.value}deg` }],
  }));

  return (
    <View
      style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: thickness,
            borderColor: colors.border,
            borderTopColor: color,
          },
          animated,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
  },
});

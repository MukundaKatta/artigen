import React from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { animation, focusRing } from '@/lib/theme';

const AnimatedPress = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  scaleValue?: number;
  /** Optional dimming on press for non-scale-friendly surfaces. */
  fadeOnPress?: boolean;
  /** Visible focus-ring on web for keyboard users. */
  focusRingOnWeb?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function AnimatedPressable({
  scaleValue = 0.97,
  fadeOnPress = false,
  focusRingOnWeb = true,
  style,
  children,
  onPressIn,
  onPressOut,
  ...props
}: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const webFocusStyle: ViewStyle =
    Platform.OS === 'web' && focusRingOnWeb
      ? ({
          outlineStyle: 'solid',
          outlineWidth: focusRing.width,
          outlineColor: 'transparent',
          outlineOffset: focusRing.offset,
        } as unknown as ViewStyle)
      : {};

  return (
    <AnimatedPress
      accessibilityRole="button"
      onPressIn={(e) => {
        scale.value = withSpring(scaleValue, animation.spring.gentle);
        if (fadeOnPress) opacity.value = withTiming(0.7, { duration: animation.duration.instant });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, animation.spring.gentle);
        if (fadeOnPress) opacity.value = withTiming(1, { duration: animation.duration.fast });
        onPressOut?.(e);
      }}
      style={[animatedStyle, webFocusStyle, style]}
      {...props}
    >
      {children}
    </AnimatedPress>
  );
}

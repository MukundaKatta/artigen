import React from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPress = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  scaleValue?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function AnimatedPressable({
  scaleValue = 0.97,
  style,
  children,
  onPressIn,
  onPressOut,
  ...props
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPress
      accessibilityRole="button"
      onPressIn={(e) => {
        scale.value = withSpring(scaleValue, { damping: 15, stiffness: 300 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        onPressOut?.(e);
      }}
      style={[animatedStyle, style as any]}
      {...props}
    >
      {children}
    </AnimatedPress>
  );
}

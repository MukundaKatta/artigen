import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

type AnimatedListItemProps = {
  index: number;
  children: React.ReactNode;
};

const MAX_STAGGER_INDEX = 8;
const STAGGER_DELAY = 60;
const DURATION = 400;

export function AnimatedListItem({ index, children }: AnimatedListItemProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    const delay = Math.min(index, MAX_STAGGER_INDEX) * STAGGER_DELAY;
    opacity.value = withDelay(delay, withTiming(1, { duration: DURATION, easing: Easing.out(Easing.ease) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: DURATION, easing: Easing.out(Easing.ease) }));
  }, [index, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

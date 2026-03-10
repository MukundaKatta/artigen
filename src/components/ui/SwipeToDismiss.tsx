import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DISMISS_THRESHOLD = SCREEN_WIDTH * 0.3;

type Props = {
  children: React.ReactNode;
  onDismiss: () => void;
  direction?: 'left' | 'right' | 'both';
  enabled?: boolean;
};

/**
 * Wraps children with a swipe-to-dismiss gesture.
 * Commonly used for dismissing cards, notifications, or list items.
 */
export function SwipeToDismiss({
  children,
  onDismiss,
  direction = 'right',
  enabled = true,
}: Props) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX([-20, 20])
    .onUpdate((event) => {
      if (direction === 'right' && event.translationX < 0) return;
      if (direction === 'left' && event.translationX > 0) return;
      translateX.value = event.translationX;
      opacity.value = 1 - Math.abs(event.translationX) / SCREEN_WIDTH;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > DISMISS_THRESHOLD) {
        const exitX = event.translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH;
        translateX.value = withTiming(exitX, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(onDismiss)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        opacity.value = withSpring(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

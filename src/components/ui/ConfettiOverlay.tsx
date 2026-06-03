import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COUNT = 40;
const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF69B4', '#7C3AED', '#0095F6'];

type ConfettiPieceProps = {
  index: number;
  trigger: boolean;
  onFinish?: () => void;
};

function ConfettiPiece({ index, trigger, onFinish }: ConfettiPieceProps) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const startX = useMemo(() => Math.random() * SCREEN_WIDTH, []);
  const delay = useMemo(() => Math.random() * 500, []);
  const drift = useMemo(() => (Math.random() - 0.5) * 120, []);
  const size = useMemo(() => 6 + Math.random() * 6, []);
  const isLast = index === CONFETTI_COUNT - 1;

  useEffect(() => {
    if (!trigger) return;

    opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
    scale.value = withDelay(delay, withTiming(1, { duration: 200, easing: Easing.out(Easing.back(2)) }));
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 50, {
        duration: 2000 + Math.random() * 1000,
        easing: Easing.in(Easing.quad),
      }),
    );
    translateX.value = withDelay(
      delay,
      withTiming(drift, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
    );
    rotate.value = withDelay(
      delay,
      withTiming(360 * (2 + Math.random() * 3), { duration: 2500 }),
    );
    opacity.value = withDelay(
      delay + 1800,
      withTiming(0, { duration: 500 }, () => {
        if (isLast && onFinish) runOnJS(onFinish)();
      }),
    );
  }, [trigger]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: startX,
          top: -20,
          width: size,
          height: size * 1.5,
          backgroundColor: color,
          borderRadius: size * 0.2,
        },
        style,
      ]}
      pointerEvents="none"
    />
  );
}

type Props = {
  visible: boolean;
  onComplete?: () => void;
};

/**
 * Full-screen confetti burst animation.
 * Use for badge unlocks, milestone achievements, challenge wins.
 */
export function ConfettiOverlay({ visible, onComplete }: Props) {
  useEffect(() => {
    if (visible && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Index key is correct here: this is a fixed-length particle array
          that never reorders or changes size, so index === stable identity. */}
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
        <ConfettiPiece
          key={i}
          index={i}
          trigger={visible}
          onFinish={i === CONFETTI_COUNT - 1 ? onComplete : undefined}
        />
      ))}
    </Animated.View>
  );
}

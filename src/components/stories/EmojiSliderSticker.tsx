import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { StorySticker } from '@/types';

type Props = {
  sticker: StorySticker;
  userId: string;
  onRespond: (response: Record<string, unknown>) => void;
};

const SLIDER_WIDTH = 180;

export function EmojiSliderSticker({ sticker, onRespond }: Props) {
  const config = sticker.config as { emoji: string; question?: string };
  const [submitted, setSubmitted] = useState(false);

  const position = useSharedValue(SLIDER_WIDTH / 2);

  function handleSubmit(value: number) {
    const normalized = Math.round((value / SLIDER_WIDTH) * 100);
    setSubmitted(true);
    onRespond({ value: normalized });
  }

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      position.value = Math.max(0, Math.min(SLIDER_WIDTH, e.x));
    })
    .onEnd(() => {
      runOnJS(handleSubmit)(position.value);
    });

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value - 14 }],
  }));

  return (
    <View style={styles.container}>
      {config.question && <Text style={styles.question}>{config.question}</Text>}
      <GestureDetector gesture={pan}>
        <View style={styles.sliderTrack}>
          <View style={styles.gradient} />
          <Animated.View style={[styles.emoji, emojiStyle]}>
            <Text style={styles.emojiText}>{config.emoji || '\u{1F60D}'}</Text>
          </Animated.View>
        </View>
      </GestureDetector>
      {submitted && <Text style={styles.thanks}>Thanks!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: SLIDER_WIDTH + spacing.md * 2,
    alignItems: 'center',
  },
  question: {
    fontSize: fontSize.md,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  sliderTrack: {
    width: SLIDER_WIDTH,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 4,
    backgroundColor: 'linear-gradient(to right, #e0e0e0, #F59E0B)',
  },
  emoji: {
    position: 'absolute',
    top: -10,
  },
  emojiText: {
    fontSize: 28,
  },
  thanks: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

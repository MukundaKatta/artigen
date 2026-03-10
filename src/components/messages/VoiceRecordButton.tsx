import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { formatDuration } from '@/services/voice.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  recording: boolean;
  duration: number;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
};

function PulsingRedDot() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 500 }),
        withTiming(1, { duration: 500 }),
      ),
      -1,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.redDot, style]} />;
}

export function VoiceRecordButton({ recording, duration, onStart, onStop, onCancel }: Props) {
  if (recording) {
    return (
      <View style={styles.recordingBar}>
        <TouchableOpacity onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onCancel();
        }} style={styles.cancelButton}>
          <Ionicons name="close" size={20} color={colors.error} />
        </TouchableOpacity>
        <View style={styles.recordingIndicator}>
          <PulsingRedDot />
          <Text style={styles.durationText}>{formatDuration(duration)}</Text>
        </View>
        <AnimatedPressable onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onStop();
        }} style={styles.sendButton} scaleValue={0.9}>
          <Ionicons name="send" size={20} color={colors.textLight} />
        </AnimatedPressable>
      </View>
    );
  }

  return (
    <AnimatedPressable onPress={() => {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onStart();
    }} hitSlop={8} scaleValue={0.9} accessibilityLabel="Record voice message">
      <Ionicons name="mic-outline" size={24} color={colors.text} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  cancelButton: {
    padding: spacing.xs,
  },
  recordingIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  durationText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

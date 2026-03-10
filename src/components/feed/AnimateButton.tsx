import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing } from '@/lib/theme';

type Props = { onPress: () => void };

export function AnimateButton({ onPress }: Props) {
  return (
    <AnimatedPressable
      style={styles.btn}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      scaleValue={0.9}
      accessibilityLabel="Animate"
    >
      <Ionicons name="videocam-outline" size={22} color={colors.text} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({ btn: { padding: spacing.xs } });

import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing } from '@/lib/theme';

type Props = { onPress: () => void };

export function TipButton({ onPress }: Props) {
  return (
    <AnimatedPressable
      style={styles.btn}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.selectionAsync();
        onPress();
      }}
      scaleValue={0.9}
    >
      <Ionicons name="gift-outline" size={22} color={colors.text} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  btn: { padding: spacing.xs },
});

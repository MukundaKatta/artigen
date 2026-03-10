import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing } from '@/lib/theme';

type Props = { onPress: () => void };

export function RestyleButton({ onPress }: Props) {
  return (
    <AnimatedPressable
      style={styles.btn}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.selectionAsync();
        onPress();
      }}
      scaleValue={0.9}
      accessibilityLabel="Restyle this artwork"
      accessibilityRole="button"
    >
      <Ionicons name="color-palette-outline" size={22} color={colors.text} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({ btn: { padding: spacing.xs } });

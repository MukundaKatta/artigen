import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  colors,
  spacing,
  fontSize,
  typography,
  borderRadius,
  hitSlop,
  opacity as opacityScale,
} from '@/lib/theme';

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Optional unit displayed after the value (px, ms, etc.) */
  unit?: string;
};

/**
 * Numeric stepper with "−" and "+" press targets. Replaces ad-hoc
 * View + TouchableOpacity + Text wrappers across settings forms.
 */
export function Stepper({ value, onChange, min = 0, max = 99, step = 1, unit }: Props) {
  const decrementDisabled = value - step < min;
  const incrementDisabled = value + step > max;

  const handleDec = () => {
    if (decrementDisabled) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onChange(value - step);
  };
  const handleInc = () => {
    if (incrementDisabled) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onChange(value + step);
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={handleDec}
        disabled={decrementDisabled}
        hitSlop={hitSlop.md}
        accessibilityRole="button"
        accessibilityLabel={`Decrease${unit ? ` ${unit}` : ''}`}
        accessibilityState={{ disabled: decrementDisabled }}
        style={({ pressed }) => [
          styles.btn,
          decrementDisabled && { opacity: opacityScale.disabled },
          pressed && { backgroundColor: colors.border },
        ]}
      >
        <Ionicons name="remove" size={18} color={colors.text} />
      </Pressable>
      <View style={styles.valueWrap}>
        <Text style={styles.value} accessibilityLiveRegion="polite">
          {value}
          {unit ? <Text style={styles.unit}> {unit}</Text> : null}
        </Text>
      </View>
      <Pressable
        onPress={handleInc}
        disabled={incrementDisabled}
        hitSlop={hitSlop.md}
        accessibilityRole="button"
        accessibilityLabel={`Increase${unit ? ` ${unit}` : ''}`}
        accessibilityState={{ disabled: incrementDisabled }}
        style={({ pressed }) => [
          styles.btn,
          incrementDisabled && { opacity: opacityScale.disabled },
          pressed && { backgroundColor: colors.border },
        ]}
      >
        <Ionicons name="add" size={18} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.full,
    padding: 2,
    alignSelf: 'flex-start',
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueWrap: {
    minWidth: 48,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  value: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  unit: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
});

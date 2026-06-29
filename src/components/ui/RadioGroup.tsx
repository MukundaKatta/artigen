import React from 'react';
import { Pressable, StyleSheet, View, Text, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import {
  colors,
  borderRadius,
  fontSize,
  typography,
  spacing,
  hitSlop,
  animation,
  opacity as opacityScale,
} from '@/lib/theme';

type Option<TValue extends string> = {
  value: TValue;
  label: string;
  description?: string;
  disabled?: boolean;
};

type Props<TValue extends string> = {
  value: TValue;
  onChange: (v: TValue) => void;
  options: Option<TValue>[];
  /** Render as a row instead of a stacked column. */
  inline?: boolean;
};

export function RadioGroup<TValue extends string>({
  value,
  onChange,
  options,
  inline = false,
}: Props<TValue>) {
  return (
    <View style={inline ? styles.row : styles.column} accessibilityRole="radiogroup">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <RadioRow
            key={o.value}
            option={o}
            selected={selected}
            onPress={() => {
              if (o.disabled || selected) return;
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              onChange(o.value);
            }}
          />
        );
      })}
    </View>
  );
}

function RadioRow<TValue extends string>({
  option,
  selected,
  onPress,
}: {
  option: Option<TValue>;
  selected: boolean;
  onPress: () => void;
}) {
  const progress = useSharedValue(selected ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, animation.spring.snappy);
  }, [selected, progress]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progress.value }],
    opacity: progress.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      disabled={option.disabled}
      hitSlop={hitSlop.md}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: option.disabled }}
      accessibilityLabel={option.label}
      accessibilityHint={option.description}
      style={[styles.option, option.disabled && { opacity: opacityScale.disabled }]}
    >
      <View style={[styles.ring, selected && { borderColor: colors.primary }]}>
        <Animated.View style={[styles.dot, dotStyle]} />
      </View>
      <View style={styles.labels}>
        <Text style={styles.label}>{option.label}</Text>
        {option.description ? <Text style={styles.description}>{option.description}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  column: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  ring: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  labels: { flex: 1 },
  label: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  description: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

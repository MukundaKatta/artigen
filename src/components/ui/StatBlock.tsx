import React from 'react';
import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  fontSize,
  typography,
  letterSpacing,
  hitSlop,
  borderRadius,
} from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';

type StatBlockProps = {
  value: number | string;
  label: string;
  /** Optional change indicator, e.g. "+12%". Green when positive, red on minus. */
  delta?: string;
  /** Optional icon shown above the value. */
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  align?: 'left' | 'center' | 'right';
  style?: StyleProp<ViewStyle>;
};

export function StatBlock({
  value,
  label,
  delta,
  icon,
  onPress,
  align = 'center',
  style,
}: StatBlockProps) {
  const formatted = typeof value === 'number' ? formatNumber(value) : value;
  const isPositive = delta?.startsWith('+');
  const isNegative = delta?.startsWith('-');

  const inner = (
    <View
      style={[
        styles.container,
        {
          alignItems: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
        },
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={colors.textSecondary}
          style={{ marginBottom: spacing.xxs }}
        />
      ) : null}
      <Text style={styles.value}>{formatted}</Text>
      <Text style={styles.label}>{label}</Text>
      {delta ? (
        <Text
          style={[
            styles.delta,
            isPositive && styles.deltaPositive,
            isNegative && styles.deltaNegative,
          ]}
        >
          {delta}
        </Text>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={hitSlop.md}
        accessibilityRole="button"
        accessibilityLabel={`${formatted} ${label}${delta ? `, ${delta}` : ''}`}
        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
      >
        {inner}
      </Pressable>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  value: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: colors.text,
    letterSpacing: letterSpacing.tight,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginTop: 2,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  },
  delta: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  deltaPositive: {
    color: colors.success,
    backgroundColor: 'rgba(88, 195, 34, 0.12)',
  },
  deltaNegative: {
    color: colors.error,
    backgroundColor: 'rgba(237, 73, 86, 0.12)',
  },
});

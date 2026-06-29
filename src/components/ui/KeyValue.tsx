import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing, fontSize, typography, letterSpacing, lineHeight } from '@/lib/theme';

type Props = {
  label: string;
  value: string | number;
  /** Stacked = label above value (default for narrow). */
  layout?: 'inline' | 'stacked';
  /** Render label tiny + uppercased (Settings-style). */
  overline?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Simple "Label: Value" row used in detail screens (profile stats,
 * receipt entries, metadata blocks).
 */
export function KeyValue({ label, value, layout = 'inline', overline = false, style }: Props) {
  if (layout === 'stacked') {
    return (
      <View style={style}>
        <Text style={[styles.label, overline && styles.overline]}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.inline, style]}>
      <Text style={[styles.label, overline && styles.overline]}>{label}</Text>
      <Text style={[styles.value, styles.inlineValue]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    gap: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  overline: {
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
    lineHeight: fontSize.md * lineHeight.normal,
  },
  inlineValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
});

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, spacing, fontSize, typography, letterSpacing } from '@/lib/theme';

type Props = {
  /** Render a "or"-style label centred on the line. */
  label?: string;
  /** Vertical inset above and below the line. */
  inset?: number;
  /** Horizontal padding (useful inside cards). */
  px?: number;
  style?: StyleProp<ViewStyle>;
  /** Hides the rule completely if you only want the label. */
  bare?: boolean;
};

export function Divider({ label, inset = spacing.md, px = 0, style, bare = false }: Props) {
  if (label) {
    return (
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: inset,
            paddingHorizontal: px,
          },
          style,
        ]}
      >
        {!bare ? <View style={styles.line} /> : null}
        <Text style={styles.label}>{label}</Text>
        {!bare ? <View style={styles.line} /> : null}
      </View>
    );
  }
  return (
    <View
      style={[styles.simple, { marginVertical: inset, marginHorizontal: px }, style]}
      accessibilityRole="none"
    />
  );
}

const styles = StyleSheet.create({
  simple: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  label: {
    marginHorizontal: spacing.md,
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  },
});

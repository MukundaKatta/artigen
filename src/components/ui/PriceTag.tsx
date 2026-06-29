import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing, fontSize, typography, borderRadius, letterSpacing } from '@/lib/theme';

type Props = {
  amount: number;
  currency?: string;
  /** Crossed-out anchor price (sale display). */
  compareAt?: number;
  size?: 'sm' | 'md' | 'lg';
  locale?: string;
  style?: StyleProp<ViewStyle>;
};

function formatMoney(amount: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

const SIZE_PX: Record<NonNullable<Props['size']>, { primary: number; compare: number }> = {
  sm: { primary: fontSize.md, compare: fontSize.xs },
  md: { primary: fontSize.lg, compare: fontSize.sm },
  lg: { primary: fontSize.xxl, compare: fontSize.md },
};

export function PriceTag({
  amount,
  currency = 'USD',
  compareAt,
  size = 'md',
  locale = 'en-US',
  style,
}: Props) {
  const dims = SIZE_PX[size];
  const primary = formatMoney(amount, currency, locale);
  const compare = compareAt != null ? formatMoney(compareAt, currency, locale) : null;
  const onSale = compareAt != null && compareAt > amount;

  return (
    <View
      style={[styles.row, style]}
      accessibilityLabel={onSale ? `On sale: ${primary}, was ${compare}` : primary}
    >
      <Text style={[styles.primary, { fontSize: dims.primary }]}>{primary}</Text>
      {compare ? <Text style={[styles.compare, { fontSize: dims.compare }]}>{compare}</Text> : null}
      {onSale ? (
        <View style={styles.saleBadge}>
          <Text style={styles.saleText}>SALE</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  primary: {
    fontFamily: typography.bold,
    color: colors.text,
    letterSpacing: letterSpacing.tight,
  },
  compare: {
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  saleBadge: {
    backgroundColor: 'rgba(237, 73, 86, 0.12)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  saleText: {
    fontSize: fontSize['2xs'],
    fontFamily: typography.bold,
    color: colors.error,
    letterSpacing: letterSpacing.widest,
  },
});

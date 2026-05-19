import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type PrintOption = { size: string; material: string; price_cents: number };
type Props = { options: PrintOption[]; selected?: number; onSelect: (index: number) => void };

export function PrintOptions({ options, selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Print Options</Text>
      {options.map((opt, i) => (
        <TouchableOpacity
          key={`${opt.size}-${opt.material}`}
          style={[styles.option, selected === i && styles.optionActive]}
          onPress={() => onSelect(i)}
          accessibilityRole="radio"
          accessibilityState={{ selected: selected === i }}
          accessibilityLabel={`${opt.size} on ${opt.material}, $${(opt.price_cents / 100).toFixed(2)}`}
        >
          <View>
            <Text style={styles.size}>{opt.size}</Text>
            <Text style={styles.material}>{opt.material}</Text>
          </View>
          <Text style={styles.price}>${(opt.price_cents / 100).toFixed(2)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  title: {
    fontSize: fontSize.md,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  size: { fontSize: fontSize.sm, fontFamily: typography.bold, color: colors.text },
  material: { fontSize: fontSize.xs, color: colors.textSecondary },
  price: { fontSize: fontSize.md, fontFamily: typography.bold, color: colors.primary },
});

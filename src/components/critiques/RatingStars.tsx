import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = {
  label: string;
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
};

export function RatingStars({ label, value, onChange, readonly = false, size = 20 }: Props) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.starsRow}>
        {stars.map((star) => {
          const filled = star <= value;
          if (readonly) {
            return (
              <Ionicons
                key={star}
                name={filled ? 'star' : 'star-outline'}
                size={size}
                color={filled ? '#F59E0B' : colors.border}
                style={styles.star}
              />
            );
          }
          return (
            <TouchableOpacity
              key={star}
              onPress={() => onChange?.(star)}
              hitSlop={4}
              activeOpacity={0.7}
            >
              <Ionicons
                name={filled ? 'star' : 'star-outline'}
                size={size}
                color={filled ? '#F59E0B' : colors.border}
                style={styles.star}
              />
            </TouchableOpacity>
          );
        })}
        {readonly && value > 0 && (
          <Text style={styles.valueText}>{value.toFixed(1)}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
    flex: 1,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 1,
  },
  valueText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    minWidth: 28,
    textAlign: 'right',
  },
});

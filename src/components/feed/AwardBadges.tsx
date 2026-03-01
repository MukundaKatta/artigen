import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { AwardSummaryItem } from '@/services/award.service';

type Props = {
  awards: AwardSummaryItem[];
  onPress?: () => void;
};

export function AwardBadges({ awards, onPress }: Props) {
  if (!awards || awards.length === 0) return null;

  const totalCount = awards.reduce((sum, a) => sum + a.count, 0);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {awards.map((award) => (
        <View key={award.award_type_id} style={styles.badge}>
          <Text style={styles.emoji}>{award.emoji}</Text>
          {award.count > 1 && (
            <Text style={styles.count}>{award.count}</Text>
          )}
        </View>
      ))}
      {totalCount > 0 && (
        <Text style={styles.totalLabel}>
          {totalCount} {totalCount === 1 ? 'award' : 'awards'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    gap: 2,
  },
  emoji: {
    fontSize: 14,
  },
  count: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  totalLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
});

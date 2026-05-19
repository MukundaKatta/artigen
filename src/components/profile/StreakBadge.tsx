import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, typography, borderRadius, withOpacity } from '@/lib/theme';

type Props = {
  currentStreak: number;
};

const STREAK_AMBER_BG = withOpacity(colors.warning, 0.12);

export function StreakBadge({ currentStreak }: Props) {
  if (currentStreak <= 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.fireIcon}>🔥</Text>
      <Text style={styles.streakText}>{currentStreak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: STREAK_AMBER_BG,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 2,
  },
  fireIcon: {
    fontSize: fontSize.sm,
  },
  streakText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.warning,
  },
});

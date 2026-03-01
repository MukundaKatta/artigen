import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  totalXp: number;
  level: number;
  xpToNext: number;
  compact?: boolean;
};

export function XpBar({ totalXp, level, xpToNext, compact = false }: Props) {
  const currentLevelXp = totalXp;
  const nextLevelXp = totalXp + xpToNext;
  const progress = nextLevelXp > 0 ? currentLevelXp / nextLevelXp : 0;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.levelBadge}>
          <Ionicons name="star" size={10} color={colors.warning} />
          <Text style={styles.levelBadgeText}>Lv {level}</Text>
        </View>
        <View style={styles.compactTrack}>
          <View style={[styles.compactFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
        </View>
        <Text style={styles.compactXp}>{totalXp} XP</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelContainer}>
          <Ionicons name="star" size={16} color={colors.warning} />
          <Text style={styles.levelText}>Level {level}</Text>
        </View>
        <Text style={styles.xpText}>
          {totalXp} / {nextLevelXp} XP
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(progress * 100, 100)}%` }]} />
      </View>
      <Text style={styles.remainingText}>
        {xpToNext} XP to next level
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  levelText: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    color: colors.text,
  },
  xpText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  track: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: 4,
  },
  remainingText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  // Compact mode
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    color: colors.warning,
  },
  compactTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactFill: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: 2,
  },
  compactXp: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    minWidth: 48,
    textAlign: 'right',
  },
});

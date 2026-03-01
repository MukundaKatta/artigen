import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { Badge } from '@/types';
import type { UserBadgeWithDetails } from '@/services/badge.service';

type Props = {
  allBadges: Badge[];
  userBadges: UserBadgeWithDetails[];
};

export function BadgeGrid({ allBadges, userBadges }: Props) {
  const earnedIds = new Set(userBadges.map((ub) => ub.badge_id));

  if (allBadges.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Achievement Badges</Text>
      <View style={styles.grid}>
        {allBadges.map((badge) => {
          const earned = earnedIds.has(badge.id);
          return (
            <View
              key={badge.id}
              style={[styles.badgeItem, !earned && styles.badgeUnearned]}
            >
              <View
                style={[
                  styles.iconContainer,
                  earned ? styles.iconEarned : styles.iconGray,
                ]}
              >
                <Ionicons
                  name={badge.icon as any}
                  size={24}
                  color={earned ? colors.textLight : colors.textSecondary}
                />
              </View>
              <Text
                style={[styles.badgeName, !earned && styles.textGray]}
                numberOfLines={1}
              >
                {badge.name}
              </Text>
              <Text
                style={[styles.badgeDesc, !earned && styles.textGray]}
                numberOfLines={2}
              >
                {badge.description}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badgeItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  badgeUnearned: {
    opacity: 0.4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconEarned: {
    backgroundColor: colors.primary,
  },
  iconGray: {
    backgroundColor: colors.border,
  },
  badgeName: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  textGray: {
    color: colors.textSecondary,
  },
});

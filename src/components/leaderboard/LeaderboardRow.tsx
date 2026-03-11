import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';
import type { LeaderboardEntry } from '@/services/leaderboard.service';

type Props = {
  entry: LeaderboardEntry;
  onPress?: (userId: string) => void;
};

function getRankStyle(rank: number) {
  if (rank === 1) return { color: '#FFD700', label: '1st' }; // gold
  if (rank === 2) return { color: '#C0C0C0', label: '2nd' }; // silver
  if (rank === 3) return { color: '#CD7F32', label: '3rd' }; // bronze
  return { color: colors.textSecondary, label: `${rank}` };
}

export const LeaderboardRow = React.memo(function LeaderboardRow({ entry, onPress }: Props) {
  const rankInfo = getRankStyle(entry.rank);
  const isTopThree = entry.rank <= 3;

  return (
    <TouchableOpacity
      style={[styles.container, isTopThree && styles.containerHighlighted]}
      onPress={() => onPress?.(entry.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.rankContainer, isTopThree && { backgroundColor: rankInfo.color + '20' }]}>
        <Text
          style={[
            styles.rankText,
            { color: rankInfo.color },
            isTopThree && styles.rankTextBold,
          ]}
        >
          {rankInfo.label}
        </Text>
      </View>

      <Avatar uri={entry.avatar_url} size="sm" />

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.username} numberOfLines={1}>
            {entry.username}
          </Text>
          {entry.is_verified && (
            <Text style={styles.verified}>✓</Text>
          )}
        </View>
        <Text style={styles.stats}>
          {formatNumber(entry.posts_count)} posts · {formatNumber(entry.followers_count)} followers
        </Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={[styles.score, isTopThree && { color: rankInfo.color }]}>
          {formatNumber(entry.score)}
        </Text>
        <Text style={styles.scoreLabel}>pts</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  containerHighlighted: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  rankContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
  },
  rankTextBold: {
    fontFamily: typography.bold,
    fontWeight: '700',
    fontSize: fontSize.lg,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  username: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  verified: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontFamily: typography.bold,
  },
  stats: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  score: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.text,
  },
  scoreLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
});

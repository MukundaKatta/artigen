import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { LeaderboardRow } from '@/components/leaderboard/LeaderboardRow';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { LeaderboardPeriod, LeaderboardEntry } from '@/services/leaderboard.service';

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'all_time', label: 'All Time' },
];

function TopThreeHeader({ entries, onPress }: { entries: LeaderboardEntry[]; onPress: (id: string) => void }) {
  const top3 = entries.slice(0, 3);
  if (top3.length === 0) return null;

  const medals = ['🥇', '🥈', '🥉'];
  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  // Display order: 2nd, 1st, 3rd for visual podium effect
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <View style={styles.topThreeContainer}>
      {podiumOrder.map((entry, index) => {
        const isFirst = entry.rank === 1;
        const medalIndex = entry.rank - 1;

        return (
          <TouchableOpacity
            key={entry.id}
            style={[styles.topCard, isFirst && styles.topCardFirst]}
            onPress={() => onPress(entry.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.medal}>{medals[medalIndex]}</Text>
            <View
              style={[
                styles.topAvatarRing,
                { borderColor: medalColors[medalIndex] },
                isFirst && styles.topAvatarRingFirst,
              ]}
            >
              <View style={styles.topAvatarPlaceholder}>
                <Text style={styles.topAvatarInitial}>
                  {entry.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.topUsername} numberOfLines={1}>
              {entry.username}
            </Text>
            <Text style={[styles.topScore, { color: medalColors[medalIndex] }]}>
              {entry.score} pts
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const { entries, loading, period, changePeriod, refresh } = useLeaderboard();

  function handleUserPress(userId: string) {
    router.push(`/(screens)/user/${userId}`);
  }

  const restEntries = entries.slice(3);

  return (
    <View style={styles.container}>
      {/* Period tabs */}
      <View style={styles.tabsContainer}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.tab, period === p.key && styles.tabActive]}
            onPress={() => changePeriod(p.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, period === p.key && styles.tabTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />
      ) : entries.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="trophy-outline" size={48} color={colors.border} />
          <Text style={styles.emptyText}>No creators yet</Text>
        </View>
      ) : (
        <FlatList
          data={restEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LeaderboardRow entry={item} onPress={handleUserPress} />
          )}
          ListHeaderComponent={<TopThreeHeader entries={entries} onPress={handleUserPress} />}
          contentContainerStyle={styles.list}
          onRefresh={refresh}
          refreshing={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textLight,
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  topCard: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: spacing.md,
  },
  topCardFirst: {
    marginBottom: spacing.lg,
  },
  medal: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  topAvatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  topAvatarRingFirst: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
  },
  topAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topAvatarInitial: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  topUsername: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    maxWidth: 90,
    textAlign: 'center',
  },
  topScore: {
    fontSize: fontSize.xs,
    fontFamily: typography.bold,
    fontWeight: '700',
    marginTop: 2,
  },
  list: {
    paddingBottom: spacing.xxxl,
  },
  loader: {
    paddingVertical: spacing.xxxl,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

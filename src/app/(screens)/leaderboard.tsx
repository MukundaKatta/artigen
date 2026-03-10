import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { LeaderboardRow } from '@/components/leaderboard/LeaderboardRow';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, spacing, fontSize, typography, borderRadius, shadows } from '@/lib/theme';
import type { LeaderboardPeriod, LeaderboardEntry } from '@/services/leaderboard.service';

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'all_time', label: 'All Time' },
];

function LeaderboardSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.topThreeContainer}>
        {[50, 64, 50].map((size, i) => (
          <View key={i} style={[styles.topCard, i === 1 && styles.topCardFirst]}>
            <Skeleton width={28} height={28} borderRadius={14} />
            <Skeleton width={size} height={size} borderRadius={size / 2} style={{ marginVertical: spacing.xs }} />
            <Skeleton width={60} height={12} />
            <Skeleton width={40} height={10} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>
      {[...Array(5)].map((_, i) => (
        <View key={i} style={styles.skeletonRow}>
          <Skeleton width={24} height={14} />
          <Skeleton width={36} height={36} borderRadius={18} style={{ marginLeft: spacing.md }} />
          <Skeleton width={100} height={14} style={{ marginLeft: spacing.md }} />
        </View>
      ))}
    </View>
  );
}

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
        const animDelay = isFirst ? 0 : index === 0 ? 150 : 300;

        return (
          <Animated.View key={entry.id} entering={FadeInUp.delay(animDelay).duration(500).springify()}>
            <TouchableOpacity
              style={[styles.topCard, isFirst && styles.topCardFirst]}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                onPress(entry.id);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${entry.username}, rank ${entry.rank}, ${entry.score} points`}
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
          </Animated.View>
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

  function handlePeriodChange(key: LeaderboardPeriod) {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    changePeriod(key);
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
            onPress={() => handlePeriodChange(p.key)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${p.label} leaderboard`}
            accessibilityState={{ selected: period === p.key }}
          >
            <Text style={[styles.tabText, period === p.key && styles.tabTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LeaderboardSkeleton />
      ) : entries.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="trophy-outline" size={32} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>No creators yet</Text>
          <Text style={styles.emptyText}>Be the first to earn points!</Text>
        </View>
      ) : (
        <FlatList
          data={restEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeIn.delay(Math.min(index, 8) * 40).duration(300)}>
              <LeaderboardRow entry={item} onPress={handleUserPress} />
            </Animated.View>
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
    ...shadows.sm,
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
  skeletonContainer: {
    paddingVertical: spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

import React, { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  getRewardHistory,
  getLoginStreak,
  ENGAGEMENT_REWARDS_INFO,
  type EngagementReward,
} from '@/services/engagement-rewards.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

const ACTION_ICONS: Record<string, string> = {
  daily_login: 'calendar-outline',
  post_created: 'create-outline',
  like_received: 'heart-outline',
  streak_bonus: 'flame-outline',
};

export default function EarnCreditsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [rewards, setRewards] = useState<EngagementReward[]>([]);
  const [streak, setStreak] = useState<{ current_streak: number; longest_streak: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getRewardHistory(user.id),
      getLoginStreak(user.id),
    ]).then(([history, streakData]) => {
      setRewards(history);
      setStreak(streakData);
    }).catch((err) => {
      logger.warn('Failed to load reward history:', err);
    }).finally(() => setLoading(false));
  }, [user]);

  const totalEarned = rewards.reduce((sum, r) => sum + r.credits_earned, 0);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Summary Cards */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Ionicons name="flash" size={24} color={colors.warning} />
                <Text style={styles.summaryValue}>{totalEarned}</Text>
                <Text style={styles.summaryLabel}>Credits Earned</Text>
              </View>
              <View style={styles.summaryCard}>
                <Ionicons name="flame" size={24} color="#FF6B35" />
                <Text style={styles.summaryValue}>{streak?.current_streak ?? 0}</Text>
                <Text style={styles.summaryLabel}>Day Streak</Text>
              </View>
              <View style={styles.summaryCard}>
                <Ionicons name="trophy" size={24} color="#FFD700" />
                <Text style={styles.summaryValue}>{streak?.longest_streak ?? 0}</Text>
                <Text style={styles.summaryLabel}>Best Streak</Text>
              </View>
            </View>

            {/* How to Earn */}
            <Text style={styles.sectionTitle}>How to Earn</Text>
            {ENGAGEMENT_REWARDS_INFO.map((info) => (
              <View key={info.action} style={styles.earnRow}>
                <View style={styles.earnIcon}>
                  <Ionicons name={ACTION_ICONS[info.action] as any} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.earnLabel}>{info.label}</Text>
                  <Text style={styles.earnDesc}>{info.description}</Text>
                </View>
                <Text style={styles.earnCredits}>+{info.credits}</Text>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Recent Activity</Text>
            {rewards.length === 0 && (
              <Text style={styles.emptyText}>Start creating and engaging to earn credits!</Text>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 20) * 30).duration(200)}>
            <View style={styles.rewardRow}>
              <View style={styles.rewardIcon}>
                <Ionicons name={ACTION_ICONS[item.action] as any ?? 'star-outline'} size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rewardAction}>{item.action.replace(/_/g, ' ')}</Text>
                <Text style={styles.rewardDate}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.rewardCredits}>+{item.credits_earned}</Text>
            </View>
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  summaryValue: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    color: colors.text,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  earnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnLabel: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  earnDesc: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  earnCredits: {
    fontSize: fontSize.md,
    fontFamily: typography.bold,
    color: colors.primary,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  rewardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardAction: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
    textTransform: 'capitalize',
  },
  rewardDate: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  rewardCredits: {
    fontSize: fontSize.sm,
    fontFamily: typography.bold,
    color: '#10B981',
  },
  emptyText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});

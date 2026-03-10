import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/providers/AuthProvider';
import { RANKS, fetchUserRank, type UserRank } from '@/services/ranks.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';

export default function RanksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRank = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await fetchUserRank(user.id);
    setUserRank(data);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadRank();
  }, [loadRank]);

  if (loading || !userRank) return <LoadingSpinner fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()} scaleValue={0.9}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </AnimatedPressable>
        <Text style={styles.title}>Creator Ranks</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Current Rank Hero */}
        <Animated.View entering={ZoomIn.delay(100)} style={[styles.heroCard, { borderColor: userRank.currentRank.color }]}>
          <View style={[styles.heroIconCircle, { backgroundColor: userRank.currentRank.color + '20' }]}>
            <Ionicons
              name={userRank.currentRank.icon as keyof typeof Ionicons.glyphMap}
              size={48}
              color={userRank.currentRank.color}
            />
          </View>
          <Text style={styles.heroRankName}>{userRank.currentRank.name}</Text>
          <Text style={styles.heroLevel}>Level {userRank.currentRank.level}</Text>
          <Text style={styles.heroXp}>{formatNumber(userRank.totalXp)} XP</Text>

          {/* Progress to next rank */}
          {userRank.nextRank && (
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${userRank.progressPercent}%`,
                      backgroundColor: userRank.currentRank.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {formatNumber(userRank.xpToNextRank)} XP to {userRank.nextRank.name}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Current Perks */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <Text style={styles.sectionTitle}>Your Perks</Text>
          <View style={styles.perksGrid}>
            {userRank.currentRank.perks.map((perk, i) => (
              <View key={i} style={styles.perkItem}>
                <Ionicons name="checkmark-circle" size={16} color={userRank.currentRank.color} />
                <Text style={styles.perkText}>{perk}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* All Ranks */}
        <Text style={styles.sectionTitle}>All Ranks</Text>
        {RANKS.map((rank, index) => {
          const isCurrentOrPast = userRank.totalXp >= rank.minXp;
          const isCurrent = rank.level === userRank.currentRank.level;

          return (
            <Animated.View
              key={rank.level}
              entering={FadeInUp.delay(300 + index * 60)}
              style={[
                styles.rankCard,
                isCurrent && { borderColor: rank.color, borderWidth: 2 },
                !isCurrentOrPast && styles.rankCardLocked,
              ]}
            >
              <View style={[styles.rankIcon, { backgroundColor: isCurrentOrPast ? rank.color + '20' : colors.border }]}>
                <Ionicons
                  name={rank.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={isCurrentOrPast ? rank.color : colors.textSecondary}
                />
              </View>
              <View style={styles.rankInfo}>
                <View style={styles.rankNameRow}>
                  <Text style={[styles.rankName, !isCurrentOrPast && styles.rankNameLocked]}>
                    {rank.name}
                  </Text>
                  {isCurrent && (
                    <View style={[styles.currentBadge, { backgroundColor: rank.color }]}>
                      <Text style={styles.currentBadgeText}>You</Text>
                    </View>
                  )}
                  {!isCurrentOrPast && (
                    <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
                  )}
                </View>
                <Text style={styles.rankXpReq}>
                  {rank.maxXp === Infinity
                    ? `${formatNumber(rank.minXp)}+ XP`
                    : `${formatNumber(rank.minXp)} - ${formatNumber(rank.maxXp)} XP`}
                </Text>
                <View style={styles.rankPerks}>
                  {rank.perks.slice(0, 2).map((perk, i) => (
                    <Text key={i} style={styles.rankPerkText}>
                      {isCurrentOrPast ? '✓' : '•'} {perk}
                    </Text>
                  ))}
                  {rank.perks.length > 2 && (
                    <Text style={styles.rankPerkMore}>+{rank.perks.length - 2} more</Text>
                  )}
                </View>
              </View>
            </Animated.View>
          );
        })}

        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    color: colors.text,
  },
  content: {
    padding: spacing.lg,
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 2,
    gap: spacing.xs,
  },
  heroIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  heroRankName: {
    fontSize: 28,
    fontFamily: typography.bold,
    color: colors.text,
  },
  heroLevel: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  heroXp: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    color: colors.primary,
  },
  progressSection: {
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  perksGrid: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  perkText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
  },
  rankCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    alignItems: 'center',
  },
  rankCardLocked: {
    opacity: 0.5,
  },
  rankIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankInfo: {
    flex: 1,
    gap: 2,
  },
  rankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rankName: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  rankNameLocked: {
    color: colors.textSecondary,
  },
  currentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  currentBadgeText: {
    fontSize: 10,
    fontFamily: typography.bold,
    color: '#fff',
  },
  rankXpReq: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  rankPerks: {
    marginTop: 2,
  },
  rankPerkText: {
    fontSize: 11,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  rankPerkMore: {
    fontSize: 11,
    fontFamily: typography.medium,
    color: colors.primary,
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { logger } from '@/lib/logger';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/providers/AuthProvider';
import { BadgeGrid } from '@/components/challenges/BadgeGrid';
import { StreakCounter } from '@/components/challenges/StreakCounter';
import { useStreak } from '@/hooks/useStreak';
import { Skeleton } from '@/components/ui/Skeleton';
import { supabase } from '@/lib/supabase';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

function BadgesSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonStreak}>
        <Skeleton width={120} height={48} borderRadius={borderRadius.md} />
        <Skeleton width={100} height={14} style={{ marginTop: spacing.sm }} />
      </View>
      <Skeleton width={120} height={16} style={{ marginLeft: spacing.lg, marginTop: spacing.lg }} />
      <View style={styles.skeletonGrid}>
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} width={80} height={80} borderRadius={40} />
        ))}
      </View>
    </View>
  );
}

export default function BadgesRoute() {
  const { user } = useAuth();
  const { streak, loading } = useStreak(user?.id);
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    Promise.resolve(
      supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
    ).then(({ data }) => setBadges(data || []))
      .catch((err: unknown) => logger.warn('Failed to load badges:', err));
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Badges & Streaks' }} />
        <BadgesSkeleton />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Badges & Streaks' }} />
      <Animated.View entering={FadeInUp.duration(400)} style={styles.streakSection}>
        <StreakCounter currentStreak={streak?.current_streak || 0} longestStreak={streak?.longest_streak || 0} />
      </Animated.View>
      <Text style={styles.sectionTitle}>Earned Badges</Text>
      <BadgeGrid badges={badges} />
      {badges.length === 0 && (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="ribbon-outline" size={32} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>No badges yet</Text>
          <Text style={styles.emptySubtitle}>Keep creating to earn badges!</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  skeletonContainer: { flex: 1 },
  skeletonStreak: { alignItems: 'center', padding: spacing.lg },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  streakSection: { padding: spacing.lg, alignItems: 'center' },
  sectionTitle: { fontSize: fontSize.md, fontFamily: typography.semiBold, color: colors.text, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  emptyContainer: {
    alignItems: 'center',
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
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

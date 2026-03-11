import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { logger } from '@/lib/logger';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { getChallenges, getActiveChallenge } from '@/services/challenge.service';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

function ChallengesSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {/* Active card placeholder */}
      <Skeleton width="100%" height={120} borderRadius={12} style={{ margin: spacing.lg }} />
      {/* Section title */}
      <Skeleton width={120} height={16} style={{ marginLeft: spacing.lg, marginTop: spacing.md }} />
      {/* Row placeholders */}
      {[...Array(5)].map((_, i) => (
        <View key={i} style={styles.skeletonRow}>
          <View style={{ flex: 1 }}>
            <Skeleton width={180} height={14} />
            <Skeleton width={100} height={10} style={{ marginTop: 4 }} />
          </View>
          <Skeleton width={18} height={18} />
        </View>
      ))}
    </View>
  );
}

export default function ChallengesRoute() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getActiveChallenge(),
      getChallenges(),
    ]).then(([activeRes, allRes]) => {
      setActive(activeRes.data);
      setChallenges(allRes.data || []);
    }).catch((err) => {
      logger.warn('Failed to load challenges:', err);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Challenges' }} />
        <ChallengesSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Challenges' }} />
      {active && (
        <Animated.View entering={FadeInUp.duration(400).springify()}>
          <AnimatedPressable
            style={styles.activeCard}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/(screens)/challenge/${active.id}`);
            }}
            scaleValue={0.97}
          >
            <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>ACTIVE</Text></View>
            <Text style={styles.activeTitle}>{active.prompt_theme}</Text>
            <Text style={styles.activeHint}>{active.description}</Text>
          </AnimatedPressable>
        </Animated.View>
      )}
      <Text style={styles.sectionTitle}>All Challenges</Text>
      <FlatList
        data={challenges}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeIn.delay(Math.min(index, 8) * 40).duration(300)}>
            <AnimatedPressable
              style={styles.row}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                router.push(`/(screens)/challenge/${item.id}`);
              }}
              scaleValue={0.98}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.prompt_theme}</Text>
                <Text style={styles.rowMeta}>daily · {item.date}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </AnimatedPressable>
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="trophy-outline" size={32} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No challenges yet</Text>
            <Text style={styles.emptySubtitle}>Check back soon for new challenges</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  skeletonContainer: { flex: 1 },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  activeCard: { margin: spacing.lg, padding: spacing.lg, backgroundColor: colors.primary + '10', borderRadius: 12, borderWidth: 1, borderColor: colors.primary + '30' },
  activeBadge: { backgroundColor: colors.primary, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: spacing.sm },
  activeBadgeText: { color: '#fff', fontSize: 10, fontFamily: typography.bold },
  activeTitle: { fontSize: fontSize.lg, fontFamily: typography.bold, color: colors.text, marginBottom: 4 },
  activeHint: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  sectionTitle: { fontSize: fontSize.md, fontFamily: typography.semiBold, color: colors.text, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowTitle: { fontSize: fontSize.md, fontFamily: typography.medium, color: colors.text },
  rowMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
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
    fontSize: fontSize.xl,
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

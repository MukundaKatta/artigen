import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/providers/AuthProvider';
import { useBattles } from '@/hooks/useBattles';
import { BattleCard } from '@/components/battles/BattleCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { BattleWithUsers } from '@/services/battle.service';

function BattlesSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {/* Create button placeholder */}
      <Skeleton width="100%" height={48} borderRadius={borderRadius.md} />
      {/* Battle card placeholders */}
      {[...Array(3)].map((_, i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonCardHeader}>
            <Skeleton width={36} height={36} borderRadius={18} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Skeleton width={120} height={14} />
              <Skeleton width={80} height={10} style={{ marginTop: 4 }} />
            </View>
          </View>
          <Skeleton width="100%" height={160} borderRadius={borderRadius.sm} style={{ marginTop: spacing.sm }} />
          <View style={styles.skeletonCardFooter}>
            <Skeleton width={60} height={12} />
            <Skeleton width={60} height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function BattlesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { battles, loading, hasMore, refresh, loadMore } = useBattles();

  const renderItem = ({ item, index }: { item: BattleWithUsers; index: number }) => (
    <Animated.View entering={FadeIn.delay(Math.min(index, 8) * 40).duration(300)}>
      <BattleCard battle={item} />
    </Animated.View>
  );

  if (loading && battles.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Art Battles' }} />
        <View style={styles.list}>
          <BattlesSkeleton />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Art Battles' }} />
      <FlatList
        data={battles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={loading}
        onRefresh={refresh}
        ListHeaderComponent={
          <Animated.View entering={FadeInUp.duration(400)}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/(screens)/battle/create');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="flash" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Start a Battle</Text>
            </TouchableOpacity>
          </Animated.View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="flash-outline" size={32} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyText}>No battles yet</Text>
            <Text style={styles.emptySubtext}>Be the first to start an art battle!</Text>
          </View>
        }
        ListFooterComponent={
          loading && battles.length > 0 ? (
            <View style={styles.footerLoader}><LoadingSpinner /></View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
  },
  skeletonContainer: {
    gap: spacing.lg,
  },
  skeletonCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
  },
  skeletonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  createButtonText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: '#fff',
  },
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
  emptyText: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
});

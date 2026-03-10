import React, { useEffect, useMemo, useRef } from 'react';
import { FlatList, View, Text, StyleSheet, TouchableOpacity, ViewabilityConfig } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useFeed } from '@/hooks/useFeed';
import { PostCard } from '@/components/feed/PostCard';
import { ChallengeCard } from '@/components/feed/ChallengeCard';
import { StoryBar } from '@/components/feed/StoryBar';
import { StoryBarSkeleton, PostCardSkeleton } from '@/components/ui/Skeleton';
import { useChallenge } from '@/hooks/useChallenge';
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { FeedPost } from '@/types';

function FeedSkeleton() {
  return (
    <View style={styles.container}>
      <StoryBarSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </View>
  );
}

function PulsingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
  }, [opacity, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: 0.8 + opacity.value * 0.4 }],
  }));

  return <Animated.View style={[styles.loadingDot, style]} />;
}

function LoadingDots() {
  return (
    <View style={styles.loadingDots}>
      <PulsingDot delay={0} />
      <PulsingDot delay={150} />
      <PulsingDot delay={300} />
    </View>
  );
}

function FeedError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconCircle}>
        <Ionicons name="cloud-offline-outline" size={28} color={colors.textSecondary} />
      </View>
      <Text style={styles.errorTitle}>Couldn't load your feed</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
        <Ionicons name="refresh" size={16} color="#fff" />
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeRoute() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    posts,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
    toggleLike,
    toggleSave,
    toggleReaction,
    onViewableItemsChanged,
  } = useFeed(user?.id);

  const viewabilityConfig = useRef<ViewabilityConfig>({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 1000,
  }).current;
  const { todayChallenge } = useChallenge(user?.id);

  const shortcuts = useMemo(() => ({
    '/': () => router.push('/(tabs)/search'),
  }), [router]);
  useKeyboardShortcuts(shortcuts);

  if (loading) return <FeedSkeleton />;

  if (error && posts.length === 0) {
    return <FeedError message={error} onRetry={refresh} />;
  }

  return (
    <ResponsiveContainer>
    <FlatList<FeedPost>
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          currentUserId={user?.id || ''}
          onLike={toggleLike}
          onSave={toggleSave}
          onReaction={toggleReaction}
          onComment={(postId) =>
            router.push(`/(screens)/comments/${postId}`)
          }
          onUserPress={(userId) =>
            router.push(`/(screens)/user/${userId}`)
          }
          onPostPress={(postId) =>
            router.push(`/(screens)/post/${postId}`)
          }
        />
      )}
      ListHeaderComponent={
        <>
          <StoryBar />
          {todayChallenge && <ChallengeCard challenge={todayChallenge} />}
        </>
      }
      ListFooterComponent={loadingMore ? <LoadingDots /> : null}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Welcome to Artigen</Text>
          <Text style={styles.emptyText}>
            Follow creators to see their AI art here, or tap + to create your own.
          </Text>
        </View>
      }
      onRefresh={refresh}
      refreshing={refreshing}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
    />
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.background,
  },
  errorIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  errorMessage: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  retryText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
});

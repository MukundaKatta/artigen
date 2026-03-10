import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, View, Text, StyleSheet, ViewabilityConfig, Platform, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
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
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useAuth } from '@/providers/AuthProvider';
import { useFeed } from '@/hooks/useFeed';
import { PostCard } from '@/components/feed/PostCard';
import { ChallengeCard } from '@/components/feed/ChallengeCard';
import { StoryBar } from '@/components/feed/StoryBar';
import { StoryBarSkeleton, PostCardSkeleton } from '@/components/ui/Skeleton';
import { AnimatedListItem } from '@/components/ui/AnimatedListItem';
import { useChallenge } from '@/hooks/useChallenge';
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { colors, spacing, fontSize, typography, borderRadius, shadows } from '@/lib/theme';
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
      <AnimatedPressable
        style={styles.retryButton}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onRetry();
        }}
        scaleValue={0.95}
      >
        <Ionicons name="refresh" size={16} color="#fff" />
        <Text style={styles.retryText}>Retry</Text>
      </AnimatedPressable>
    </View>
  );
}

export default function HomeRoute() {
  const { user } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
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

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowScrollTop(e.nativeEvent.contentOffset.y > 800);
  }, []);

  const scrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const onComment = useCallback((postId: string) => {
    router.push(`/(screens)/comments/${postId}`);
  }, [router]);

  const onUserPress = useCallback((userId: string) => {
    router.push(`/(screens)/user/${userId}`);
  }, [router]);

  const onPostPress = useCallback((postId: string) => {
    router.push(`/(screens)/post/${postId}`);
  }, [router]);

  const currentUserId = user?.id || '';

  const renderItem = useCallback(({ item, index }: { item: FeedPost; index: number }) => (
    <AnimatedListItem index={index}>
      <PostCard
        post={item}
        currentUserId={currentUserId}
        onLike={toggleLike}
        onSave={toggleSave}
        onReaction={toggleReaction}
        onComment={onComment}
        onUserPress={onUserPress}
        onPostPress={onPostPress}
      />
    </AnimatedListItem>
  ), [currentUserId, toggleLike, toggleSave, toggleReaction, onComment, onUserPress, onPostPress]);

  if (loading) return <FeedSkeleton />;

  if (error && posts.length === 0) {
    return <FeedError message={error} onRetry={refresh} />;
  }

  return (
    <ResponsiveContainer>
    <FlatList<FeedPost>
      ref={flatListRef}
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={
        <>
          <StoryBar />
          {todayChallenge && <ChallengeCard challenge={todayChallenge} />}
        </>
      }
      ListFooterComponent={loadingMore ? <LoadingDots /> : null}
      ListEmptyComponent={
        <View style={styles.empty}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="sparkles" size={32} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Welcome to Artigen</Text>
          <Text style={styles.emptyText}>
            Follow creators to see their AI art here, or tap + to create your own.
          </Text>
        </View>
      }
      onRefresh={refresh}
      refreshing={refreshing}
      progressViewOffset={10}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      onScroll={handleScroll}
      scrollEventThrottle={200}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      showsVerticalScrollIndicator={false}
      windowSize={7}
      maxToRenderPerBatch={5}
      removeClippedSubviews
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
    />
    {showScrollTop && (
      <AnimatedPressable
        style={styles.scrollTopButton}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.selectionAsync();
          scrollToTop();
        }}
        scaleValue={0.9}
      >
        <Ionicons name="chevron-up" size={20} color="#fff" />
      </AnimatedPressable>
    )}
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
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 149, 246, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  scrollTopButton: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? spacing.xl : 100,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
});

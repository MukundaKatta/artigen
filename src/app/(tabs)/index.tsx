import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, View, Text, StyleSheet, ViewabilityConfig, Platform, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { FlashList, ViewToken } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  FadeInUp,
  FadeOutUp,
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
import { useRealtimeFeed } from '@/hooks/useRealtimeFeed';
import { useScrollToTopOnTabPress } from '@/app/(tabs)/_layout';
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/providers/ThemeProvider';
import { colors, spacing, fontSize, typography, borderRadius, shadows } from '@/lib/theme';
import type { FeedPost } from '@/types';

function FeedSkeleton() {
  // Uses ThemeProvider for dark mode support
  const { themeColors: tc } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}>
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
  const { themeColors: tc } = useTheme();
  return (
    <View style={[styles.errorContainer, { backgroundColor: tc.background }]}>
      <View style={[styles.errorIconCircle, { backgroundColor: tc.backgroundSecondary }]}>
        <Ionicons name="cloud-offline-outline" size={28} color={tc.textSecondary} />
      </View>
      <Text style={[styles.errorTitle, { color: tc.text }]}>Couldn't load your feed</Text>
      <Text style={[styles.errorMessage, { color: tc.textSecondary }]}>{message}</Text>
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
  const { themeColors } = useTheme();
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
  const { newPostCount, resetCount } = useRealtimeFeed(user?.id);

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

  // Register scroll-to-top on tab re-tap
  useScrollToTopOnTabPress('index', scrollToTop);

  const onComment = useCallback((postId: string) => {
    router.push(`/(screens)/comments/${postId}`);
  }, [router]);

  const onUserPress = useCallback((userId: string) => {
    router.push(`/(screens)/user/${userId}`);
  }, [router]);

  const onPostPress = useCallback((postId: string) => {
    router.push(`/(screens)/post/${postId}`);
  }, [router]);

  // Use ref to avoid re-creating callback (and re-rendering all PostCards) when posts change
  const postsRef = useRef(posts);
  postsRef.current = posts;

  const onPromptRemix = useCallback((postId: string) => {
    const post = postsRef.current.find((p) => p.id === postId);
    if (!post?.ai_metadata) return;
    router.push({
      pathname: '/(camera)/generate',
      params: {
        remixPrompt: post.ai_metadata.prompt,
        remixModelId: post.ai_metadata.model_id,
        remixOfPostId: postId,
      },
    });
  }, [router]);

  const currentUserId = user?.id || '';

  const listContentStyle = useMemo(
    () => ({ paddingBottom: 80, backgroundColor: themeColors.background }),
    [themeColors.background],
  );

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
        onPromptRemix={onPromptRemix}
      />
    </AnimatedListItem>
  ), [currentUserId, toggleLike, toggleSave, toggleReaction, onComment, onUserPress, onPostPress, onPromptRemix]);

  if (loading) return <FeedSkeleton />;

  if (error && posts.length === 0) {
    return <FeedError message={error} onRetry={refresh} />;
  }

  return (
    <ResponsiveContainer>
    <FlashList<FeedPost>
      ref={flatListRef as any}
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      estimatedItemSize={500}
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
            <Ionicons name="sparkles" size={32} color={themeColors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: themeColors.text }]}>Welcome to Artigen</Text>
          <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
            Follow creators to see their AI art here, or create your own masterpiece.
          </Text>
          <View style={styles.emptyCTAs}>
            <AnimatedPressable
              style={styles.emptyCTAPrimary}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/create');
              }}
              scaleValue={0.95}
              accessibilityLabel="Create your first artwork"
              accessibilityRole="button"
            >
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.emptyCTAPrimaryText}>Create Artwork</Text>
            </AnimatedPressable>
            <AnimatedPressable
              style={[styles.emptyCTASecondary, { backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                router.push('/(tabs)/search');
              }}
              scaleValue={0.95}
              accessibilityLabel="Explore and discover art"
              accessibilityRole="button"
            >
              <Ionicons name="compass-outline" size={18} color={colors.primary} />
              <Text style={styles.emptyCTASecondaryText}>Explore Art</Text>
            </AnimatedPressable>
          </View>
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
      drawDistance={500}
      contentContainerStyle={listContentStyle}
    />
    {(showScrollTop || newPostCount > 0) && (
      <Animated.View entering={FadeInUp.duration(300)} exiting={FadeOutUp.duration(200)}>
        <AnimatedPressable
          style={styles.newPostsPill}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            scrollToTop();
            refresh();
            resetCount();
          }}
          scaleValue={0.95}
          accessibilityLabel={newPostCount > 0 ? `${newPostCount} new posts, tap to refresh` : 'Scroll to top and refresh feed'}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-up" size={14} color="#fff" />
          <Text style={styles.newPostsPillText}>
            {newPostCount > 0 ? `${newPostCount} New Post${newPostCount > 1 ? 's' : ''}` : 'New Posts'}
          </Text>
        </AnimatedPressable>
      </Animated.View>
    )}
    {showScrollTop && (
      <AnimatedPressable
        style={styles.scrollTopButton}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.selectionAsync();
          scrollToTop();
        }}
        scaleValue={0.9}
        accessibilityRole="button"
        accessibilityLabel="Scroll to top"
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
  emptyCTAs: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  emptyCTAPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  emptyCTAPrimaryText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
  emptyCTASecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyCTASecondaryText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.primary,
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
  newPostsPill: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  newPostsPillText: {
    fontSize: fontSize.sm,
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

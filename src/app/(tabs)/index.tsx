import React, { useMemo, useRef } from 'react';
import { FlatList, View, Text, StyleSheet, ViewabilityConfig } from 'react-native';
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
import { colors, spacing, fontSize, typography } from '@/lib/theme';
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

function LoadingDots() {
  return (
    <View style={styles.loadingDots}>
      <View style={[styles.loadingDot, { opacity: 0.3 }]} />
      <View style={[styles.loadingDot, { opacity: 0.6 }]} />
      <View style={[styles.loadingDot, { opacity: 0.9 }]} />
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
    marginHorizontal: 3,
  },
});

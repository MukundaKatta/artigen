import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInUp,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfilePostGrid } from '@/components/profile/ProfilePostGrid';
import { CollectionGrid } from '@/components/profile/CollectionGrid';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCollections } from '@/hooks/useCollections';
import { supabase } from '@/lib/supabase';
import { useScrollToTopOnTabPress } from '@/app/(tabs)/_layout';
import { spacing, fontSize, typography } from '@/lib/theme';
import type { Post, PostMedia } from '@/types/database';

type GridPost = Post & { media: PostMedia[] };
type Tab = 'posts' | 'saved';

const PARALLAX_HEIGHT = 180;

function PostGridSkeleton() {
  return (
    <View style={skeletonStyles.grid}>
      {[...Array(9)].map((_, i) => (
        <Skeleton key={i} width="32%" height={120} borderRadius={2} style={skeletonStyles.gridItem} />
      ))}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    padding: 1,
  },
  gridItem: {
    flexGrow: 1,
  },
});

export function ProfileScreen() {
  const { profile, user } = useAuth();
  const { themeColors } = useTheme();
  const router = useRouter();
  const [posts, setPosts] = useState<GridPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const { collections, loading: collectionsLoading } = useCollections(user?.id);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Parallax scroll tracking
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const parallaxStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-PARALLAX_HEIGHT, 0, PARALLAX_HEIGHT],
      [-PARALLAX_HEIGHT / 2, 0, PARALLAX_HEIGHT * 0.75],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(
      scrollY.value,
      [-PARALLAX_HEIGHT, 0],
      [2, 1],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, PARALLAX_HEIGHT * 0.6],
      [0, 0.6],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  useScrollToTopOnTabPress('profile', scrollToTop);

  const handleRefresh = useCallback(async () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setRefreshing(true);
    await fetchUserPosts();
    setRefreshing(false);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts();
    }
  }, [user?.id]);

  async function fetchUserPosts() {
    if (!user?.id) return;
    setLoading(true);

    const { data } = await supabase
      .from('posts')
      .select('*, media:post_media(*)')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    setPosts((data as unknown as GridPost[]) || []);
    setLoading(false);
  }

  if (!profile) {
    return <LoadingSpinner fullScreen />;
  }

  const coverUrl = (profile as Record<string, unknown>).cover_url as string | null;

  // Build tabs with icons
  const tabs = [
    {
      key: 'posts',
      label: 'Posts',
      icon: (
        <Ionicons
          name="grid-outline"
          size={22}
          color={activeTab === 'posts' ? themeColors.text : themeColors.textSecondary}
        />
      ),
    },
    {
      key: 'saved',
      label: 'Saved',
      icon: (
        <Ionicons
          name="bookmark-outline"
          size={22}
          color={activeTab === 'saved' ? themeColors.text : themeColors.textSecondary}
        />
      ),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Parallax Cover Photo */}
        <View style={styles.parallaxWrapper}>
          <Animated.View style={[styles.parallaxContainer, parallaxStyle]}>
            {coverUrl ? (
              <Image
                source={{ uri: coverUrl }}
                style={styles.coverImage}
                contentFit="cover"
                transition={300}
              />
            ) : (
              <View style={[styles.coverGradient, { backgroundColor: themeColors.primary }]}>
                <Ionicons name="sparkles" size={32} color="rgba(255,255,255,0.3)" />
              </View>
            )}
          </Animated.View>
          <Animated.View style={[styles.coverOverlay, overlayStyle]} />
        </View>

        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          isCurrentUser={true}
          isFollowing={false}
          followLoading={false}
          onFollowPress={() => {}}
          onEditPress={() => router.push('/(screens)/edit-profile')}
          onFollowersPress={() => router.push(`/(screens)/followers/${user?.id}`)}
          onFollowingPress={() => router.push(`/(screens)/following/${user?.id}`)}
        />

        {/* Animated Tab Bar */}
        <AnimatedTabBar
          tabs={tabs}
          activeKey={activeTab}
          onTabPress={(key) => setActiveTab(key as Tab)}
        />

        {/* Content */}
        {activeTab === 'posts' ? (
          loading ? (
            <PostGridSkeleton />
          ) : posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: themeColors.backgroundSecondary }]}>
                <Ionicons name="camera-outline" size={32} color={themeColors.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No posts yet</Text>
              <Text style={[styles.emptySubtext, { color: themeColors.textSecondary }]}>
                Tap the + button to create your first AI artwork
              </Text>
            </View>
          ) : (
            <ProfilePostGrid
              posts={posts}
              onPostPress={(postId) => router.push(`/(screens)/post/${postId}`)}
            />
          )
        ) : collectionsLoading ? (
          <PostGridSkeleton />
        ) : collections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: themeColors.backgroundSecondary }]}>
              <Ionicons name="bookmark-outline" size={32} color={themeColors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No saved posts</Text>
            <Text style={[styles.emptySubtext, { color: themeColors.textSecondary }]}>
              Save posts you love to find them here
            </Text>
          </View>
        ) : (
          <CollectionGrid
            collections={collections}
            onCreateNew={() => {}}
          />
        )}

        {/* Insights Link */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <AnimatedPressable
            style={styles.insightsRow}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              router.push('/(screens)/scheduled-posts');
            }}
            scaleValue={0.97}
            accessibilityLabel="View scheduled posts and insights"
            accessibilityRole="button"
          >
            <Ionicons name="bar-chart-outline" size={18} color={themeColors.primary} />
            <Text style={[styles.insightsText, { color: themeColors.primary }]}>Scheduled Posts & Insights</Text>
            <Ionicons name="chevron-forward" size={16} color={themeColors.primary} />
          </AnimatedPressable>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  parallaxWrapper: {
    height: PARALLAX_HEIGHT,
    overflow: 'hidden',
  },
  parallaxContainer: {
    height: PARALLAX_HEIGHT,
    width: '100%',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  insightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  insightsText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
  },
});

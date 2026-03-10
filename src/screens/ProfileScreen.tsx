import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/providers/AuthProvider';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfilePostGrid } from '@/components/profile/ProfilePostGrid';
import { CollectionGrid } from '@/components/profile/CollectionGrid';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCollections } from '@/hooks/useCollections';
import { supabase } from '@/lib/supabase';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import type { Post, PostMedia } from '@/types/database';

type GridPost = Post & { media: PostMedia[] };
type Tab = 'posts' | 'saved';

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
  const router = useRouter();
  const [posts, setPosts] = useState<GridPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const { collections, loading: collectionsLoading } = useCollections(user?.id);

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

  // Build tabs with icons
  const tabs = [
    {
      key: 'posts',
      label: 'Posts',
      icon: (
        <Ionicons
          name="grid-outline"
          size={22}
          color={activeTab === 'posts' ? colors.text : colors.textSecondary}
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
          color={activeTab === 'saved' ? colors.text : colors.textSecondary}
        />
      ),
    },
  ];

  return (
    <FlatList
      data={[]}
      renderItem={null}
      style={styles.container}
      ListHeaderComponent={
        <>
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
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="camera-outline" size={32} color={colors.textSecondary} />
                </View>
                <Text style={styles.emptyTitle}>No posts yet</Text>
                <Text style={styles.emptySubtext}>
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
              <View style={styles.emptyIconCircle}>
                <Ionicons name="bookmark-outline" size={32} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No saved posts</Text>
              <Text style={styles.emptySubtext}>
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
          <TouchableOpacity
            style={styles.insightsRow}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              router.push('/(screens)/scheduled-posts');
            }}
            activeOpacity={0.6}
          >
            <Ionicons name="bar-chart-outline" size={18} color={colors.primary} />
            <Text style={styles.insightsText}>Scheduled Posts & Insights</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
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
    color: colors.primary,
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfilePostGrid } from '@/components/profile/ProfilePostGrid';
import { CollectionGrid } from '@/components/profile/CollectionGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCollections } from '@/hooks/useCollections';
import { supabase } from '@/lib/supabase';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import type { Post, PostMedia } from '@/types/database';

type GridPost = Post & { media: PostMedia[] };
type Tab = 'posts' | 'saved';

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

          {/* Tab Bar */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
              onPress={() => setActiveTab('posts')}
            >
              <Ionicons
                name="grid-outline"
                size={22}
                color={activeTab === 'posts' ? colors.text : colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
              onPress={() => setActiveTab('saved')}
            >
              <Ionicons
                name="bookmark-outline"
                size={22}
                color={activeTab === 'saved' ? colors.text : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {activeTab === 'posts' ? (
            loading ? (
              <LoadingSpinner />
            ) : (
              <ProfilePostGrid
                posts={posts}
                onPostPress={(postId) => router.push(`/(screens)/post/${postId}`)}
              />
            )
          ) : collectionsLoading ? (
            <LoadingSpinner />
          ) : (
            <CollectionGrid
              collections={collections}
              onCreateNew={() => {}}
            />
          )}

          {/* Insights Link (for own profile) */}
          <TouchableOpacity
            style={styles.insightsRow}
            onPress={() => router.push('/(screens)/scheduled-posts')}
          >
            <Ionicons name="bar-chart-outline" size={18} color={colors.primary} />
            <Text style={styles.insightsText}>Scheduled Posts & Insights</Text>
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
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.text,
  },
  insightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  insightsText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.primary,
  },
});

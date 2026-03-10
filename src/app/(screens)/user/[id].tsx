import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { useFollow } from '@/hooks/useFollow';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfilePostGrid } from '@/components/profile/ProfilePostGrid';
import { Skeleton } from '@/components/ui/Skeleton';
import { supabase } from '@/lib/supabase';
import { colors, spacing } from '@/lib/theme';
import type { Post, PostMedia } from '@/types/database';

type GridPost = Post & { media: PostMedia[] };

function ProfileSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {/* Avatar + stats row */}
      <View style={styles.skeletonTopRow}>
        <Skeleton width={80} height={80} borderRadius={40} />
        <View style={styles.skeletonStats}>
          <Skeleton width={50} height={14} />
          <Skeleton width={50} height={14} />
          <Skeleton width={50} height={14} />
        </View>
      </View>
      {/* Name and bio */}
      <View style={styles.skeletonBio}>
        <Skeleton width={120} height={14} />
        <Skeleton width={200} height={12} style={{ marginTop: 6 }} />
        <Skeleton width={160} height={12} style={{ marginTop: 4 }} />
      </View>
      {/* Action button */}
      <Skeleton width="100%" height={36} borderRadius={8} style={{ marginTop: spacing.md }} />
      {/* Grid */}
      <View style={styles.skeletonGrid}>
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} width="32%" height={120} borderRadius={2} style={{ flexGrow: 1 }} />
        ))}
      </View>
    </View>
  );
}

export default function UserProfileRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const { profile, loading: profileLoading } = useProfile(id);
  const { isFollowing, loading: followLoading, toggleFollow } = useFollow(user?.id, id!);
  const [posts, setPosts] = useState<GridPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // Set the header title to the username
  useEffect(() => {
    if (profile?.username) {
      navigation.setOptions({ title: profile.username });
    }
  }, [profile?.username]);

  useEffect(() => {
    if (id) {
      fetchUserPosts();
    }
  }, [id]);

  async function fetchUserPosts() {
    setPostsLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('*, media:post_media(*)')
      .eq('user_id', id!)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    setPosts((data as unknown as GridPost[]) || []);
    setPostsLoading(false);
  }

  if (profileLoading || !profile) {
    return (
      <View style={styles.container}>
        <ProfileSkeleton />
      </View>
    );
  }

  const isCurrentUser = user?.id === id;

  return (
    <FlatList
      data={[]}
      renderItem={null}
      style={styles.container}
      ListHeaderComponent={
        <>
          <ProfileHeader
            profile={profile}
            isCurrentUser={isCurrentUser}
            isFollowing={isFollowing}
            followLoading={followLoading}
            onFollowPress={toggleFollow}
            onEditPress={() => router.push('/(screens)/edit-profile')}
            onFollowersPress={() => router.push(`/(screens)/followers/${id}`)}
            onFollowingPress={() => router.push(`/(screens)/following/${id}`)}
          />
          {postsLoading ? (
            <View style={styles.skeletonGrid}>
              {[...Array(9)].map((_, i) => (
                <Skeleton key={i} width="32%" height={120} borderRadius={2} style={{ flexGrow: 1 }} />
              ))}
            </View>
          ) : (
            <ProfilePostGrid
              posts={posts}
              onPostPress={(postId) => router.push(`/(screens)/post/${postId}`)}
            />
          )}
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
  skeletonContainer: {
    padding: spacing.lg,
  },
  skeletonTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: spacing.xl,
  },
  skeletonBio: {
    marginTop: spacing.md,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    padding: 1,
    marginTop: spacing.md,
  },
});

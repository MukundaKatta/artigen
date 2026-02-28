import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfilePostGrid } from '@/components/profile/ProfilePostGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { supabase } from '@/lib/supabase';
import { colors } from '@/lib/theme';
import type { Post, PostMedia } from '@/types/database';

type GridPost = Post & { media: PostMedia[] };

export function ProfileScreen() {
  const { profile, user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<GridPost[]>([]);
  const [loading, setLoading] = useState(true);

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
          {loading ? (
            <LoadingSpinner />
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
});

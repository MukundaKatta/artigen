import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { useFollow } from '@/hooks/useFollow';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfilePostGrid } from '@/components/profile/ProfilePostGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { supabase } from '@/lib/supabase';
import { colors } from '@/lib/theme';
import type { Post, PostMedia } from '@/types/database';

type GridPost = Post & { media: PostMedia[] };

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

    setPosts((data as GridPost[]) || []);
    setPostsLoading(false);
  }

  if (profileLoading || !profile) {
    return <LoadingSpinner fullScreen />;
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

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useBlendFeed } from '@/hooks/useBlendFeed';
import { BlendFeedView } from '@/components/messages/BlendFeedView';
import { colors } from '@/lib/theme';

export default function BlendRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { posts, loading } = useBlendFeed(id);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Blend Feed' }} />
      {loading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <BlendFeedView
          posts={posts}
          onPostPress={(postId) => router.push(`/(screens)/post/${postId}`)}
          loading={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});

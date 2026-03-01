import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';
import { ScheduledPostsList } from '@/components/profile/ScheduledPostsList';
import { colors } from '@/lib/theme';

export default function ScheduledPostsRoute() {
  const { user } = useAuth();
  const { posts, cancel, publishNow } = useScheduledPosts(user?.id);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Scheduled Posts' }} />
      <ScheduledPostsList
        posts={posts}
        onCancel={async (id) => { await cancel(id); }}
        onPublish={async (id) => { await publishNow(id); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

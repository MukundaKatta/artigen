import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getFollowing } from '@/services/follow.service';
import { colors, fontSize, spacing } from '@/lib/theme';
import type { Profile } from '@/types/database';

export default function FollowingRoute() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const [following, setFollowing] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchFollowing();
  }, [userId]);

  async function fetchFollowing() {
    const { data } = await getFollowing(userId!);
    const profiles = data?.map((item: any) => item.profiles).filter(Boolean) || [];
    setFollowing(profiles);
    setLoading(false);
  }

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <FlatList
      data={following}
      keyExtractor={(item) => item.id}
      style={styles.container}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push(`/(screens)/user/${item.id}`)}
        >
          <Avatar uri={item.avatar_url} size="md" />
          <View style={styles.info}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.fullName}>{item.full_name}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Not following anyone yet</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  info: {
    marginLeft: spacing.md,
  },
  username: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  fullName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
});

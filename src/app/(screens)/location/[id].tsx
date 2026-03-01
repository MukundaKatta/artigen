import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getLocation, getLocationPosts } from '@/services/location.service';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import { POST_GRID_SIZE, POST_GRID_GAP } from '@/lib/constants';
import type { Location } from '@/types';

export default function LocationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [location, setLocation] = useState<Location | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [locResult, postsResult] = await Promise.all([
        getLocation(id),
        getLocationPosts(id),
      ]);
      setLocation(locResult.data);
      setPosts(postsResult.data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Location' }} />
        <ActivityIndicator style={{ marginTop: 100 }} color={colors.textSecondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: location?.name || 'Location' }} />

      {/* Location Header */}
      {location && (
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="location" size={24} color={colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.locationName}>{location.name}</Text>
            {location.address && (
              <Text style={styles.address}>{location.address}</Text>
            )}
            <Text style={styles.postCount}>{location.post_count} posts</Text>
          </View>
        </View>
      )}

      {/* Posts Grid */}
      <FlatList
        data={posts}
        keyExtractor={(item: any) => item.id}
        numColumns={3}
        renderItem={({ item }: { item: any }) => {
          const media = (item.media || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
          const firstMedia = media[0];
          return (
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => router.push(`/(screens)/post/${item.id}`)}
            >
              {firstMedia && (
                <Image source={{ uri: firstMedia.media_url }} style={styles.gridImage} contentFit="cover" />
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No posts at this location yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.text,
  },
  address: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  postCount: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginTop: 4,
  },
  gridItem: {
    width: POST_GRID_SIZE,
    height: POST_GRID_SIZE,
    marginRight: POST_GRID_GAP,
    marginBottom: POST_GRID_GAP,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});

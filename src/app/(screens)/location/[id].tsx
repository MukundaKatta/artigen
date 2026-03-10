import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { getLocation, getLocationPosts } from '@/services/location.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import { POST_GRID_SIZE, POST_GRID_GAP } from '@/lib/constants';
import { sortMediaByOrder } from '@/utils/media';
import type { Location } from '@/types';

function LocationSkeleton() {
  return (
    <View>
      <View style={styles.skeletonHeader}>
        <Skeleton width={56} height={56} borderRadius={28} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Skeleton width={160} height={18} />
          <Skeleton width={100} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <View style={styles.skeletonGrid}>
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} width="32%" height={120} borderRadius={2} style={{ flexGrow: 1 }} />
        ))}
      </View>
    </View>
  );
}

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
        <LocationSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: location?.name || 'Location' }} />

      {/* Location Header */}
      {location && (
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
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
        </Animated.View>
      )}

      {/* Posts Grid */}
      <FlatList
        data={posts}
        keyExtractor={(item: any) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item, index }: { item: any; index: number }) => {
          const media = sortMediaByOrder(item.media);
          const firstMedia = media[0];
          return (
            <Animated.View entering={FadeIn.delay(Math.min(index, 8) * 30).duration(250)}>
              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  router.push(`/(screens)/post/${item.id}`);
                }}
                activeOpacity={0.8}
              >
                {firstMedia && (
                  <Image source={{ uri: firstMedia.media_url }} style={styles.gridImage} contentFit="cover" transition={200} />
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="location-outline" size={32} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No posts at this location</Text>
            <Text style={styles.emptySubtitle}>Be the first to share from here</Text>
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
  skeletonHeader: {
    flexDirection: 'row',
    padding: spacing.lg,
    alignItems: 'center',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    padding: 1,
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
  gridRow: {
    gap: POST_GRID_GAP,
  },
  gridItem: {
    width: POST_GRID_SIZE,
    height: POST_GRID_SIZE,
    marginBottom: POST_GRID_GAP,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

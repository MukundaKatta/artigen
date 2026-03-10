import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { getHashtagPosts } from '@/services/explore.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { POST_GRID_SIZE, POST_GRID_GAP, EXPLORE_PAGE_SIZE } from '@/lib/constants';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';
import type { PostWithUser } from '@/types';

export default function HashtagRoute() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [hashtag, setHashtag] = useState<{ id: string; name: string; post_count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!name) return;
    setLoading(true);
    const { data, hashtag: h } = await getHashtagPosts(name, 0);
    setPosts(data);
    setHashtag(h);
    setPage(0);
    setHasMore(data.length >= EXPLORE_PAGE_SIZE);
    setLoading(false);
  }, [name]);

  const loadMore = useCallback(async () => {
    if (!name || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data } = await getHashtagPosts(name, nextPage);
    setPosts((prev) => [...prev, ...data]);
    setPage(nextPage);
    setHasMore(data.length >= EXPLORE_PAGE_SIZE);
    setLoadingMore(false);
  }, [name, page, loadingMore, hasMore]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  function handlePostPress(postId: string) {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push(`/(screens)/post/${postId}`);
  }

  function renderItem({ item, index }: { item: PostWithUser; index: number }) {
    const firstMedia = item.media?.[0];
    const isVideo = item.post_type === 'video' || item.post_type === 'reel';
    const isCarousel = (item.media?.length || 0) > 1;

    return (
      <Animated.View entering={FadeIn.delay(Math.min(index, 8) * 30).duration(250)}>
        <TouchableOpacity
          onPress={() => handlePostPress(item.id)}
          activeOpacity={0.8}
        >
          <View style={styles.gridItem}>
            <Image
              source={{ uri: firstMedia?.media_url }}
              style={styles.gridImage}
              contentFit="cover"
              transition={200}
            />
            {(isCarousel || isVideo) && (
              <View style={styles.typeIcon}>
                <Ionicons
                  name={isVideo ? 'play' : 'copy-outline'}
                  size={16}
                  color={colors.textLight}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `#${name}` }} />

      {loading ? (
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonHeader}>
            <Skeleton width={180} height={24} />
            <Skeleton width={80} height={14} style={{ marginTop: spacing.xs }} />
          </View>
          <View style={styles.skeletonGrid}>
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} width="32%" height={120} borderRadius={2} style={{ flexGrow: 1 }} />
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={3}
          columnWrapperStyle={styles.gridRow}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            hashtag ? (
              <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
                <Text style={styles.hashtagName}>#{hashtag.name}</Text>
                <Text style={styles.postCount}>
                  {formatNumber(hashtag.post_count)} {hashtag.post_count === 1 ? 'post' : 'posts'}
                </Text>
              </Animated.View>
            ) : null
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}><LoadingSpinner /></View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="pricetag-outline" size={32} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No posts with this hashtag</Text>
              <Text style={styles.emptySubtitle}>Be the first to use #{name}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skeletonContainer: {
    flex: 1,
  },
  skeletonHeader: {
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
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginBottom: POST_GRID_GAP,
  },
  hashtagName: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.text,
  },
  postCount: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  gridRow: {
    gap: POST_GRID_GAP,
  },
  gridItem: {
    width: POST_GRID_SIZE,
    height: POST_GRID_SIZE,
    marginBottom: POST_GRID_GAP,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  typeIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
  emptyContainer: {
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

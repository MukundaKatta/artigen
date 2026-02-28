import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { getHashtagPosts } from '@/services/explore.service';
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
    router.push(`/(screens)/post/${postId}`);
  }

  function renderItem({ item }: { item: PostWithUser }) {
    const firstMedia = item.media?.[0];
    const isVideo = item.post_type === 'video' || item.post_type === 'reel';
    const isCarousel = (item.media?.length || 0) > 1;

    return (
      <TouchableOpacity
        onPress={() => handlePostPress(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.gridItem}>
          <Image
            source={{ uri: firstMedia?.media_url }}
            style={styles.gridImage}
            contentFit="cover"
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
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `#${name}` }} />

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.textSecondary} />
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
              <View style={styles.header}>
                <Text style={styles.hashtagName}>#{hashtag.name}</Text>
                <Text style={styles.postCount}>
                  {formatNumber(hashtag.post_count)} {hashtag.post_count === 1 ? 'post' : 'posts'}
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={styles.footerLoader} color={colors.textSecondary} />
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No posts with this hashtag yet</Text>
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
  header: {
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
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
  loader: {
    marginTop: spacing.xxxl,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.xxxl,
  },
});

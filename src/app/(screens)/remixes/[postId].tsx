import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { getRemixes } from '@/services/remix.service';
import { POST_GRID_SIZE, POST_GRID_GAP } from '@/lib/constants';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type RemixPost = {
  id: string;
  user: { id: string; username: string; avatar_url: string | null };
  media: { media_url: string }[];
  post_type: string;
  ai_metadata?: { model_name: string } | null;
};

export default function RemixesRoute() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const [remixes, setRemixes] = useState<RemixPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchRemixes = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const { data } = await getRemixes(postId, 0);
    setRemixes(data as unknown as RemixPost[]);
    setPage(0);
    setHasMore(data.length >= 20);
    setLoading(false);
  }, [postId]);

  const loadMore = useCallback(async () => {
    if (!postId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data } = await getRemixes(postId, nextPage);
    setRemixes((prev) => [...prev, ...(data as unknown as RemixPost[])]);
    setPage(nextPage);
    setHasMore(data.length >= 20);
    setLoadingMore(false);
  }, [postId, page, loadingMore, hasMore]);

  useEffect(() => {
    fetchRemixes();
  }, [fetchRemixes]);

  function renderItem({ item }: { item: RemixPost }) {
    const firstMedia = item.media?.[0];
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(screens)/post/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.gridItem}>
          <Image
            source={{ uri: firstMedia?.media_url }}
            style={styles.gridImage}
            contentFit="cover"
          />
          {item.ai_metadata && (
            <View style={styles.sparkleIcon}>
              <Ionicons name="sparkles" size={12} color="#fff" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={remixes}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={3}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.grid}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <View style={styles.center}>
          <Ionicons name="git-branch-outline" size={48} color={colors.border} />
          <Text style={styles.emptyText}>No remixes yet</Text>
          <Text style={styles.emptySubtext}>
            Be the first to remix this post!
          </Text>
        </View>
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator style={styles.footer} color={colors.primary} />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.background,
  },
  grid: {
    backgroundColor: colors.background,
    minHeight: '100%',
  },
  row: {
    gap: POST_GRID_GAP,
    marginBottom: POST_GRID_GAP,
  },
  gridItem: {
    width: POST_GRID_SIZE,
    height: POST_GRID_SIZE,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  sparkleIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});

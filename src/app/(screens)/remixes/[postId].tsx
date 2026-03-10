import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { getRemixes } from '@/services/remix.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
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

  function renderItem({ item, index }: { item: RemixPost; index: number }) {
    const firstMedia = item.media?.[0];
    return (
      <Animated.View entering={FadeIn.delay(Math.min(index, 8) * 30).duration(250)}>
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            router.push(`/(screens)/post/${item.id}`);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.gridItem}>
            <Image
              source={{ uri: firstMedia?.media_url }}
              style={styles.gridImage}
              contentFit="cover"
              transition={200}
            />
            {item.ai_metadata && (
              <View style={styles.sparkleIcon}>
                <Ionicons name="sparkles" size={12} color="#fff" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.skeletonGrid}>
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} width="32%" height={120} borderRadius={2} style={{ flexGrow: 1 }} />
          ))}
        </View>
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
        <View style={styles.emptyCenter}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="git-branch-outline" size={32} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyText}>No remixes yet</Text>
          <Text style={styles.emptySubtext}>
            Be the first to remix this post!
          </Text>
        </View>
      }
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footer}><LoadingSpinner /></View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    padding: 1,
    marginTop: spacing.md,
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
    backgroundColor: colors.backgroundSecondary,
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
  emptyCenter: {
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
  emptyText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
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

import React, { useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SCREEN_WIDTH } from '@/lib/constants';
import { colors, spacing, borderRadius } from '@/lib/theme';
import type { PostMedia } from '@/types/database';

type MasonryPost = {
  id: string;
  media: PostMedia[];
  ai_metadata?: unknown[] | null;
};

type Props = {
  posts: MasonryPost[];
  onPostPress: (postId: string) => void;
  onEndReached?: () => void;
  loading?: boolean;
};

const COLUMN_GAP = spacing.xs;
const COLUMN_COUNT = 2;
const COLUMN_WIDTH = (SCREEN_WIDTH - COLUMN_GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

const END_REACHED_THRESHOLD = 200;

export function MasonryGrid({ posts, onPostPress, onEndReached, loading }: Props) {
  const hasCalledEndReached = useRef(false);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!onEndReached) return;
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);

      if (distanceFromBottom <= END_REACHED_THRESHOLD) {
        if (!hasCalledEndReached.current) {
          hasCalledEndReached.current = true;
          onEndReached();
        }
      } else {
        hasCalledEndReached.current = false;
      }
    },
    [onEndReached]
  );

  // Split posts into two columns, balancing total height
  const { leftColumn, rightColumn } = useMemo(() => {
    const left: { post: MasonryPost; height: number }[] = [];
    const right: { post: MasonryPost; height: number }[] = [];
    let leftHeight = 0;
    let rightHeight = 0;

    for (const post of posts) {
      const firstMedia = post.media?.[0];
      const imageHeight =
        firstMedia?.height && firstMedia?.width
          ? (COLUMN_WIDTH * firstMedia.height) / firstMedia.width
          : COLUMN_WIDTH; // default square

      const item = { post, height: imageHeight };

      if (leftHeight <= rightHeight) {
        left.push(item);
        leftHeight += imageHeight + COLUMN_GAP;
      } else {
        right.push(item);
        rightHeight += imageHeight + COLUMN_GAP;
      }
    }

    return { leftColumn: left, rightColumn: right };
  }, [posts]);

  const renderItem = (
    item: { post: MasonryPost; height: number },
    index: number,
    columnOffset: number
  ) => {
    const { post, height } = item;
    const firstMedia = post.media?.[0];
    const hasAiMetadata =
      Array.isArray((post as any).ai_metadata) &&
      (post as any).ai_metadata.length > 0;

    return (
      <Animated.View
        key={post.id}
        entering={FadeInDown.delay(Math.min(index + columnOffset, 11) * 50).duration(300)}
      >
        <AnimatedPressable
          onPress={() => onPostPress(post.id)}
          scaleValue={0.97}
        >
          <View style={[styles.cell, { height }]}>
            <Image
              source={{ uri: firstMedia?.media_url }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
            {hasAiMetadata && (
              <View style={styles.aiIcon}>
                <Ionicons name="sparkles" size={14} color={colors.textLight} />
              </View>
            )}
          </View>
        </AnimatedPressable>
      </Animated.View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <View style={styles.columns}>
        <View style={styles.column}>
          {leftColumn.map((item, index) => renderItem(item, index, 0))}
        </View>
        <View style={styles.column}>
          {rightColumn.map((item, index) =>
            renderItem(item, index, leftColumn.length)
          )}
        </View>
      </View>
      {loading && (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="small" color={colors.primary} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  columns: {
    flexDirection: 'row',
    paddingHorizontal: COLUMN_GAP,
    gap: COLUMN_GAP,
  },
  column: {
    flex: 1,
    gap: COLUMN_GAP,
  },
  cell: {
    width: '100%',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  aiIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: borderRadius.full,
    padding: 4,
  },
  loadingContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});

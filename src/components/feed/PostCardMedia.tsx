import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { SCREEN_WIDTH } from '@/lib/constants';
import { colors, spacing } from '@/lib/theme';
import type { PostMedia } from '@/types';
import type { StyleProp, ViewStyle } from 'react-native';

type PostCardMediaProps = {
  media: PostMedia[];
  onDoubleTap: () => void;
  heartStyle: StyleProp<ViewStyle>;
};

export const PostCardMedia = React.memo(function PostCardMedia({
  media,
  onDoubleTap,
  heartStyle,
}: PostCardMediaProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScrollEnd = useCallback((e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  }, []);

  const renderCarouselItem = useCallback(
    ({ item, index }: { item: PostMedia; index: number }) => {
      // The active page and its immediate neighbors render at high priority;
      // anything further out defers until the user scrolls to it.
      const distance = Math.abs(index - activeIndex);
      const priority = distance === 0 ? 'high' : distance === 1 ? 'normal' : 'low';
      return (
        <Image
          source={{ uri: item.media_url }}
          placeholder={item.blurhash ? { blurhash: item.blurhash } : undefined}
          style={styles.postImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          priority={priority}
          transition={300}
          recyclingKey={item.id}
        />
      );
    },
    [activeIndex]
  );

  const keyExtractor = useCallback((item: PostMedia) => item.id, []);

  return (
    <>
      <Pressable onPress={onDoubleTap} accessibilityRole="image" accessibilityLabel="Post image, double tap to like">
        <View>
          {media.length === 1 ? (
            <Image
              source={{ uri: media[0]?.media_url }}
              placeholder={media[0]?.blurhash ? { blurhash: media[0].blurhash } : undefined}
              style={styles.postImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={300}
              recyclingKey={media[0]?.id}
            />
          ) : (
            <FlatList
              data={media}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={keyExtractor}
              onMomentumScrollEnd={handleScrollEnd}
              renderItem={renderCarouselItem}
            />
          )}

          {/* Heart animation overlay */}
          <Animated.View style={[styles.heartOverlay, heartStyle]}>
            <Ionicons name="heart" size={80} color="#fff" />
          </Animated.View>
        </View>
      </Pressable>

      {/* Carousel dots */}
      {media.length > 1 && (
        <View style={styles.dotsContainer}>
          {media.map((item, i) => (
            <Animated.View
              key={item.id}
              style={[
                styles.dot,
                i === activeIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  postImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  heartOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

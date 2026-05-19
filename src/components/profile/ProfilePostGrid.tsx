import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { POST_GRID_SIZE, POST_GRID_GAP } from '@/lib/constants';
import { colors } from '@/lib/theme';
import type { Post, PostMedia } from '@/types/database';

type GridPost = Post & { media: PostMedia[]; is_pinned?: boolean; pinned_at?: string | null };

type Props = {
  posts: GridPost[];
  onPostPress: (postId: string) => void;
};

export function ProfilePostGrid({ posts, onPostPress }: Props) {
  // Sort: pinned posts first (by pinned_at desc), then by created_at desc
  const sorted = [...posts].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    if (a.is_pinned && b.is_pinned) {
      return new Date(b.pinned_at || 0).getTime() - new Date(a.pinned_at || 0).getTime();
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <View style={styles.grid}>
      {sorted.map((post, index) => {
        const firstMedia = post.media?.[0];
        const isCarousel = post.media?.length > 1;
        const isVideo = post.post_type === 'video' || post.post_type === 'reel';

        return (
          <Animated.View
            key={post.id}
            entering={FadeInDown.delay(Math.min(index, 11) * 50).duration(300)}
          >
            <AnimatedPressable onPress={() => onPostPress(post.id)} scaleValue={0.97}>
              <View style={styles.gridItem}>
                <Image
                  source={{ uri: firstMedia?.media_url }}
                  style={styles.gridImage}
                  contentFit="cover"
                  transition={200}
                />
                {post.is_pinned && (
                  <View style={styles.pinIcon}>
                    <Ionicons name="pin" size={14} color={colors.textLight} />
                  </View>
                )}
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
            </AnimatedPressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: POST_GRID_GAP,
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
  typeIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  pinIcon: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
});

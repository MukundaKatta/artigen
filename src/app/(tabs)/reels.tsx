import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useReels } from '@/hooks/useReels';
import { Avatar } from '@/components/ui/Avatar';
import { formatNumber } from '@/utils/format-number';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import type { FeedPost } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 49;
const REEL_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT;

export default function ReelsRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    reels,
    loading,
    loadingMore,
    loadMore,
    toggleLike,
    toggleSave,
  } = useReels(user?.id);
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  function renderReel({ item, index }: { item: FeedPost; index: number }) {
    const firstMedia = item.media?.[0];

    return (
      <View style={styles.reelContainer}>
        {/* Background image/video */}
        <Image
          source={{ uri: firstMedia?.media_url }}
          style={styles.reelImage}
          contentFit="cover"
        />

        {/* Right side actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => toggleLike(item.id)}
          >
            <Ionicons
              name={item.isLiked ? 'heart' : 'heart-outline'}
              size={28}
              color={item.isLiked ? colors.like : colors.textLight}
            />
            <Text style={styles.actionCount}>{formatNumber(item.likes_count)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push(`/(screens)/comments/${item.id}`)}
          >
            <Ionicons name="chatbubble-outline" size={26} color={colors.textLight} />
            <Text style={styles.actionCount}>{formatNumber(item.comments_count)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="paper-plane-outline" size={26} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => toggleSave(item.id)}
          >
            <Ionicons
              name={item.isSaved ? 'bookmark' : 'bookmark-outline'}
              size={26}
              color={colors.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom info */}
        <View style={styles.bottomInfo}>
          <TouchableOpacity
            style={styles.userRow}
            onPress={() => router.push(`/(screens)/user/${item.user.id}`)}
          >
            <Avatar uri={item.user.avatar_url} size="sm" />
            <Text style={styles.username}>{item.user.username}</Text>
          </TouchableOpacity>
          {item.caption ? (
            <Text style={styles.caption} numberOfLines={2}>
              {item.caption}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.textLight} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        renderItem={renderReel}
        pagingEnabled
        snapToInterval={REEL_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: REEL_HEIGHT,
          offset: REEL_HEIGHT * index,
          index,
        })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No reels yet</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.textLight} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelContainer: {
    height: REEL_HEIGHT,
    width: '100%',
    position: 'relative',
  },
  reelImage: {
    ...StyleSheet.absoluteFillObject,
  },
  // Right side actions
  actions: {
    position: 'absolute',
    right: spacing.md,
    bottom: 120,
    alignItems: 'center',
  },
  actionItem: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  actionCount: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    marginTop: 2,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  // Bottom info
  bottomInfo: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: 60,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  username: {
    color: colors.textLight,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    fontSize: fontSize.md,
    marginLeft: spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  caption: {
    color: colors.textLight,
    fontFamily: typography.regular,
    fontSize: fontSize.sm,
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  emptyContainer: {
    height: REEL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textLight,
    fontSize: fontSize.lg,
    marginTop: spacing.md,
  },
  footerLoader: {
    height: REEL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

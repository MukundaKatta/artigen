import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ViewToken,
  Platform,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useAuth } from '@/providers/AuthProvider';
import { useReels } from '@/hooks/useReels';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatNumber } from '@/utils/format-number';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import type { FeedPost } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 49;
const REEL_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT;

function ReelItem({
  item,
  isActive,
  onLike,
  onSave,
  onComment,
  onUserPress,
}: {
  item: FeedPost;
  isActive: boolean;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onComment: (id: string) => void;
  onUserPress: (id: string) => void;
}) {
  const firstMedia = item.media?.[0];
  const lastTapRef = useRef(0);

  // Heart overlay animation
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  // Like button animation
  const likeScale = useSharedValue(1);
  const likeButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!item.isLiked) {
        onLike(item.id);
      }
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Heart overlay
      heartScale.value = 0;
      heartOpacity.value = 1;
      heartScale.value = withSpring(1, { damping: 6, stiffness: 200 });
      heartOpacity.value = withDelay(600, withTiming(0, { duration: 300 }));
    }
    lastTapRef.current = now;
  }, [item.id, item.isLiked, onLike, heartScale, heartOpacity]);

  const handleLike = useCallback(() => {
    likeScale.value = withSequence(
      withSpring(1.4, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 6, stiffness: 300 })
    );
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLike(item.id);
  }, [item.id, onLike, likeScale]);

  const handleSave = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave(item.id);
  }, [item.id, onSave]);

  return (
    <View style={styles.reelContainer}>
      <Pressable onPress={handleDoubleTap} style={StyleSheet.absoluteFill} accessibilityRole="image" accessibilityLabel="Reel image, double tap to like">
        <Image
          source={{ uri: firstMedia?.media_url }}
          placeholder={firstMedia?.blurhash ? { blurhash: firstMedia.blurhash } : undefined}
          style={styles.reelImage}
          contentFit="cover"
          transition={200}
        />
      </Pressable>

      {/* Heart overlay */}
      <Animated.View style={[styles.heartOverlay, heartStyle]} pointerEvents="none">
        <Ionicons name="heart" size={100} color="#fff" />
      </Animated.View>

      {/* Bottom gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Top gradient for status bar */}
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />

      {/* Right side actions */}
      <View style={styles.actions}>
        <AnimatedPressable style={styles.actionItem} onPress={handleLike} accessibilityRole="button" accessibilityLabel={item.isLiked ? 'Unlike' : 'Like'} scaleValue={0.85}>
          <Animated.View style={likeButtonStyle}>
            <Ionicons
              name={item.isLiked ? 'heart' : 'heart-outline'}
              size={30}
              color={item.isLiked ? colors.like : '#fff'}
            />
          </Animated.View>
          <Text style={styles.actionCount}>{formatNumber(item.likes_count)}</Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.actionItem}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            onComment(item.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={`${formatNumber(item.comments_count)} comments`}
          scaleValue={0.85}
        >
          <Ionicons name="chatbubble-outline" size={28} color="#fff" />
          <Text style={styles.actionCount}>{formatNumber(item.comments_count)}</Text>
        </AnimatedPressable>

        <AnimatedPressable style={styles.actionItem} accessibilityRole="button" accessibilityLabel="Share" scaleValue={0.85}>
          <Ionicons name="paper-plane-outline" size={28} color="#fff" />
        </AnimatedPressable>

        <AnimatedPressable style={styles.actionItem} onPress={handleSave} accessibilityRole="button" accessibilityLabel={item.isSaved ? 'Unsave' : 'Save'} scaleValue={0.85}>
          <Ionicons
            name={item.isSaved ? 'bookmark' : 'bookmark-outline'}
            size={28}
            color="#fff"
          />
        </AnimatedPressable>

        {item.ai_metadata && (
          <View style={styles.aiIndicator} accessibilityLabel="AI generated">
            <Ionicons name="sparkles" size={14} color="#fff" />
          </View>
        )}
      </View>

      {/* Bottom info */}
      <View style={styles.bottomInfo}>
        <AnimatedPressable
          style={styles.userRow}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            onUserPress(item.user.id);
          }}
          scaleValue={0.97}
          accessibilityRole="button"
          accessibilityLabel={`View ${item.user.username}'s profile`}
        >
          <Avatar uri={item.user.avatar_url} size="sm" />
          <Text style={styles.username}>{item.user.username}</Text>
          {item.user.is_verified && (
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
          )}
        </AnimatedPressable>
        {item.caption ? (
          <Text style={styles.caption} numberOfLines={2}>
            {item.caption}
          </Text>
        ) : null}
        {item.ai_metadata?.model_name && (
          <View style={styles.modelRow}>
            <Ionicons name="sparkles" size={10} color="rgba(255,255,255,0.6)" />
            <Text style={styles.modelText}>{item.ai_metadata.model_name}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

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
        if (Platform.OS !== 'web') Haptics.selectionAsync();
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleComment = useCallback((postId: string) => {
    router.push(`/(screens)/comments/${postId}`);
  }, [router]);

  const handleUserPress = useCallback((userId: string) => {
    router.push(`/(screens)/user/${userId}`);
  }, [router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ReelItem
            item={item}
            isActive={index === activeIndex}
            onLike={toggleLike}
            onSave={toggleSave}
            onComment={handleComment}
            onUserPress={handleUserPress}
          />
        )}
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
            <Ionicons name="videocam-outline" size={56} color="rgba(255,255,255,0.5)" />
            <Text style={styles.emptyTitle}>No reels yet</Text>
            <Text style={styles.emptySubtitle}>AI-generated reels will appear here</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <LoadingSpinner color="#fff" />
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
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
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
  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
  },
  topGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 100,
  },
  // Right side actions
  actions: {
    position: 'absolute',
    right: spacing.md,
    bottom: 140,
    alignItems: 'center',
  },
  actionItem: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  actionCount: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    marginTop: 3,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  aiIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(139,92,246,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Bottom info
  bottomInfo: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: 70,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  username: {
    color: '#fff',
    fontFamily: typography.semiBold,
    fontWeight: '600',
    fontSize: fontSize.md,
    marginLeft: spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  caption: {
    color: '#fff',
    fontFamily: typography.regular,
    fontSize: fontSize.sm,
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  modelText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
  },
  emptyContainer: {
    height: REEL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  footerLoader: {
    height: REEL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

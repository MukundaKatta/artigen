import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
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
import { useRouter } from 'expo-router';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { Avatar } from '@/components/ui/Avatar';
import { RichText } from '@/components/shared/RichText';
import { ReactionPicker } from '@/components/feed/ReactionPicker';
import { ReactionSummary } from '@/components/feed/ReactionSummary';
import { CollaboratorAvatars } from '@/components/feed/CollaboratorAvatars';
import { PostInsightsButton } from '@/components/feed/PostInsights';
import { LocationTag } from '@/components/feed/LocationTag';
import { TipButton } from '@/components/feed/TipButton';
import { ProvenanceBadge } from '@/components/feed/ProvenanceBadge';
import { SCREEN_WIDTH } from '@/lib/constants';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import { timeAgo } from '@/utils/format-date';
import { formatNumber } from '@/utils/format-number';
import type { FeedPost, PostMedia, ReactionType } from '@/types';

type PostCardProps = {
  post: FeedPost;
  currentUserId: string;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string) => void;
  onUserPress: (userId: string) => void;
  onPostPress: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onPin?: (postId: string) => void;
  onUnpin?: (postId: string) => void;
  onReport?: (postId: string) => void;
  onBlock?: (userId: string) => void;
  onReaction?: (postId: string, type: ReactionType) => void;
  onSaveToCollection?: (postId: string) => void;
  onRemix?: (postId: string) => void;
  onTip?: (postId: string, recipientId: string) => void;
  onRestyle?: (postId: string, imageUrl: string) => void;
  onAnimate?: (postId: string, imageUrl: string) => void;
  onPromptRemix?: (postId: string) => void;
};

export const PostCard = React.memo(function PostCard({
  post,
  currentUserId,
  onLike,
  onSave,
  onComment,
  onUserPress,
  onPostPress,
  onDelete,
  onShare,
  onPin,
  onUnpin,
  onReport,
  onBlock,
  onReaction,
  onSaveToCollection,
  onRemix,
  onTip,
  onRestyle,
  onAnimate,
  onPromptRemix,
}: PostCardProps) {
  const router = useRouter();
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showAiDetails, setShowAiDetails] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const lastTapRef = useRef(0);

  // Double-tap heart animation
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  // Like button bounce
  const likeScale = useSharedValue(1);
  const saveScale = useSharedValue(1);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  const likeButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const saveButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const triggerHeartAnimation = useCallback(() => {
    heartScale.value = 0;
    heartOpacity.value = 1;
    heartScale.value = withSpring(1, { damping: 6, stiffness: 200 });
    heartOpacity.value = withDelay(600, withTiming(0, { duration: 300 }));
  }, [heartScale, heartOpacity]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!post.isLiked) {
        onLike(post.id);
      }
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      triggerHeartAnimation();
    }
    lastTapRef.current = now;
  }, [post.id, post.isLiked, onLike, triggerHeartAnimation]);

  const handleLike = useCallback(() => {
    likeScale.value = withSequence(
      withSpring(1.3, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 6, stiffness: 300 })
    );
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLike(post.id);
  }, [post.id, onLike, likeScale]);

  const handleLongPressLike = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowReactionPicker(true);
  }, []);

  const handleReaction = useCallback((type: ReactionType) => {
    if (onReaction) {
      onReaction(post.id, type);
    }
  }, [post.id, onReaction]);

  const handleLongPressSave = useCallback(() => {
    if (onSaveToCollection) {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSaveToCollection(post.id);
    }
  }, [post.id, onSaveToCollection]);

  const handleSave = useCallback(() => {
    saveScale.value = withSequence(
      withSpring(1.2, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 6, stiffness: 300 })
    );
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave(post.id);
  }, [post.id, onSave, saveScale]);

  const handleMore = useCallback(() => {
    setShowActionSheet(true);
  }, []);

  const sortedMedia = useMemo(
    () => [...(post.media || [])].sort((a, b) => a.sort_order - b.sort_order),
    [post.media]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => onUserPress(post.user.id)}
        >
          <Avatar uri={post.user.avatar_url} size="sm" />
          <View style={styles.headerText}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{post.user.username}</Text>
              {post.ai_metadata && (
                <View style={styles.aiBadge}>
                  <Ionicons name="sparkles" size={10} color="#fff" />
                  <Text style={styles.aiBadgeText}>AI</Text>
                </View>
              )}
            </View>
            {post.location ? (
              <LocationTag locationId={post.location_id} locationName={post.location} />
            ) : null}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMore} hitSlop={12} accessibilityRole="button" accessibilityLabel="More options">
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Remix badge */}
      {post.remixOf && (
        <TouchableOpacity
          style={styles.remixBadge}
          onPress={() => onPostPress(post.remixOf!.id)}
        >
          <Ionicons name="git-branch-outline" size={12} color="#8B5CF6" />
          <Text style={styles.remixBadgeText}>
            Remixed from <Text style={styles.remixBadgeUsername}>@{post.remixOf.user.username}</Text>
          </Text>
        </TouchableOpacity>
      )}

      {/* Image / Carousel */}
      <Pressable onPress={handleDoubleTap}>
        <View>
          {sortedMedia.length === 1 ? (
            <Image
              source={{ uri: sortedMedia[0]?.media_url }}
              placeholder={sortedMedia[0]?.blurhash ? { blurhash: sortedMedia[0].blurhash } : undefined}
              style={styles.postImage}
              contentFit="cover"
              transition={300}
              recyclingKey={sortedMedia[0]?.id}
            />
          ) : (
            <FlatList
              data={sortedMedia}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x / SCREEN_WIDTH
                );
                setActiveIndex(index);
              }}
              renderItem={({ item }: { item: PostMedia }) => (
                <Image
                  source={{ uri: item.media_url }}
                  placeholder={item.blurhash ? { blurhash: item.blurhash } : undefined}
                  style={styles.postImage}
                  contentFit="cover"
                  transition={300}
                  recyclingKey={item.id}
                />
              )}
            />
          )}

          {/* Heart animation overlay */}
          <Animated.View style={[styles.heartOverlay, heartStyle]}>
            <Ionicons name="heart" size={80} color="#fff" />
          </Animated.View>
        </View>
      </Pressable>

      {/* Carousel dots */}
      {sortedMedia.length > 1 && (
        <View style={styles.dotsContainer}>
          {sortedMedia.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      )}

      {/* Collaborators */}
      {post.collaborators && post.collaborators.length > 0 && (
        <CollaboratorAvatars collaborators={post.collaborators} />
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity
            onPress={handleLike}
            onLongPress={handleLongPressLike}
            hitSlop={12}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={post.isLiked ? 'Unlike post' : 'Like post'}
            accessibilityState={{ selected: post.isLiked }}
          >
            <Animated.View style={likeButtonStyle}>
              <Ionicons
                name={post.isLiked ? 'heart' : 'heart-outline'}
                size={26}
                color={post.isLiked ? colors.like : colors.text}
              />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onComment(post.id)}
            hitSlop={12}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={`Comment on post, ${post.comments_count} comments`}
          >
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={12}
            style={styles.actionButton}
            onPress={() => onShare?.(post.id)}
            accessibilityRole="button"
            accessibilityLabel="Share post"
          >
            <Ionicons
              name="paper-plane-outline"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          {post.ai_metadata && onRemix && (
            <TouchableOpacity hitSlop={8} style={styles.actionButton} onPress={() => onRemix(post.id)}>
              <Ionicons
                name="git-branch-outline"
                size={24}
                color="#8B5CF6"
              />
            </TouchableOpacity>
          )}
          {onTip && post.user_id !== currentUserId && (
            <TipButton onPress={() => onTip(post.id, post.user_id)} />
          )}
        </View>
        <View style={styles.actionsRight}>
          {post.has_provenance && (
            <ProvenanceBadge onPress={() => router.push(`/(screens)/provenance/${post.id}`)} />
          )}
          <TouchableOpacity
            onPress={handleSave}
            onLongPress={handleLongPressSave}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={post.isSaved ? 'Unsave post' : 'Save post'}
            accessibilityState={{ selected: post.isSaved }}
          >
            <Animated.View style={saveButtonStyle}>
              <Ionicons
                name={post.isSaved ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={colors.text}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reaction Summary or Likes */}
      {post.reactionSummary && post.reactionSummary.length > 0 ? (
        <ReactionSummary summary={post.reactionSummary} totalCount={post.likes_count} />
      ) : post.likes_count > 0 ? (
        <Text style={styles.likesText}>
          {formatNumber(post.likes_count)} {post.likes_count === 1 ? 'like' : 'likes'}
        </Text>
      ) : null}

      {/* Remix count */}
      {post.remixCount != null && post.remixCount > 0 && (
        <TouchableOpacity
          onPress={() => router.push(`/(screens)/remixes/${post.id}`)}
          style={styles.remixCountRow}
        >
          <Ionicons name="git-branch-outline" size={14} color="#8B5CF6" />
          <Text style={styles.remixCountText}>
            {post.remixCount} {post.remixCount === 1 ? 'remix' : 'remixes'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Post Insights (own posts only) */}
      {post.user_id === currentUserId && (
        <PostInsightsButton
          viewsCount={post.views_count || 0}
          onPress={() => router.push(`/(screens)/insights/${post.id}`)}
        />
      )}

      {/* Caption */}
      {post.caption ? (
        <TouchableOpacity
          onPress={() => setCaptionExpanded(!captionExpanded)}
          activeOpacity={0.8}
        >
          <RichText
            style={styles.captionText}
            numberOfLines={captionExpanded ? undefined : 2}
            username={post.user.username}
          >
            {post.caption}
          </RichText>
        </TouchableOpacity>
      ) : null}

      {/* AI Details */}
      {post.ai_metadata && (
        <TouchableOpacity
          onPress={() => setShowAiDetails(!showAiDetails)}
          style={styles.aiDetailsToggle}
          activeOpacity={0.7}
        >
          <Ionicons name="sparkles-outline" size={14} color="#8B5CF6" />
          <Text style={styles.aiDetailsToggleText}>
            {showAiDetails ? 'Hide' : 'View'} AI Details
          </Text>
        </TouchableOpacity>
      )}

      {showAiDetails && post.ai_metadata && (
        <View style={styles.aiDetailsContainer}>
          <View style={styles.aiDetailRow}>
            <Text style={styles.aiDetailLabel}>Model</Text>
            <Text style={styles.aiDetailValue}>{post.ai_metadata.model_name}</Text>
          </View>
          <View style={styles.aiDetailRow}>
            <Text style={styles.aiDetailLabel}>Prompt</Text>
            <Text style={styles.aiDetailValue} selectable>{post.ai_metadata.prompt}</Text>
          </View>
          {post.ai_metadata.negative_prompt ? (
            <View style={styles.aiDetailRow}>
              <Text style={styles.aiDetailLabel}>Neg. Prompt</Text>
              <Text style={styles.aiDetailValue}>{post.ai_metadata.negative_prompt}</Text>
            </View>
          ) : null}
          {(post.ai_metadata.style_tags as string[])?.length > 0 && (
            <View style={styles.aiTagsRow}>
              {(post.ai_metadata.style_tags as string[]).map((tag: string) => (
                <View key={tag} style={styles.aiTag}>
                  <Text style={styles.aiTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={styles.aiSettingsRow}>
            {(post.ai_metadata.settings as any)?.steps != null && (
              <Text style={styles.aiSettingChip}>Steps: {(post.ai_metadata.settings as any).steps}</Text>
            )}
            {(post.ai_metadata.settings as any)?.cfg_scale != null && (
              <Text style={styles.aiSettingChip}>CFG: {(post.ai_metadata.settings as any).cfg_scale}</Text>
            )}
            {(post.ai_metadata.settings as any)?.seed != null && (
              <Text style={styles.aiSettingChip}>Seed: {(post.ai_metadata.settings as any).seed}</Text>
            )}
            {post.ai_metadata.generation_time_ms != null && (
              <Text style={styles.aiSettingChip}>
                {(post.ai_metadata.generation_time_ms / 1000).toFixed(1)}s
              </Text>
            )}
          </View>
        </View>
      )}

      {/* View comments link */}
      {post.comments_count > 0 && (
        <TouchableOpacity onPress={() => onComment(post.id)}>
          <Text style={styles.viewComments}>
            View all {formatNumber(post.comments_count)} comments
          </Text>
        </TouchableOpacity>
      )}

      {/* Timestamp */}
      <Text style={styles.timestamp}>{timeAgo(post.created_at)}</Text>

      {/* Reaction Picker */}
      <ReactionPicker
        visible={showReactionPicker}
        onClose={() => setShowReactionPicker(false)}
        onSelect={handleReaction}
        currentReaction={post.userReaction}
      />

      {/* Action sheet */}
      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        items={[
          // Owner actions
          ...(post.user_id === currentUserId
            ? [
                ...(onPin && !post.is_pinned
                  ? [{ label: 'Pin to Profile', onPress: () => onPin(post.id) }]
                  : []),
                ...(onUnpin && post.is_pinned
                  ? [{ label: 'Unpin from Profile', onPress: () => onUnpin(post.id) }]
                  : []),
                ...(onDelete
                  ? [{ label: 'Delete Post', destructive: true, onPress: () => onDelete(post.id) }]
                  : []),
              ]
            : [
                // Other user actions
                ...(onReport
                  ? [{ label: 'Report Post', onPress: () => onReport(post.id) }]
                  : []),
                ...(onBlock
                  ? [{ label: `Block @${post.user.username}`, destructive: true, onPress: () => onBlock(post.user_id) }]
                  : []),
              ]),
          // AI-powered actions (available to everyone)
          ...(post.ai_metadata && onPromptRemix
            ? [{ label: 'Remix Prompt', onPress: () => onPromptRemix(post.id) }]
            : []),
          ...(onRestyle && sortedMedia[0]?.media_url
            ? [{ label: 'Restyle Image', onPress: () => onRestyle(post.id, sortedMedia[0].media_url) }]
            : []),
          ...(onAnimate && sortedMedia[0]?.media_url
            ? [{ label: 'Animate Image', onPress: () => onAnimate(post.id, sortedMedia[0].media_url) }]
            : []),
          {
            label: '🎓 AI Art Coach',
            onPress: () => router.push({
              pathname: '/(screens)/art-coach/[postId]',
              params: {
                postId: post.id,
                imageUrl: sortedMedia[0]?.media_url ?? '',
                prompt: post.ai_metadata?.prompt ?? '',
              },
            }),
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  username: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  location: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.regular,
    marginTop: 1,
  },
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionButton: {
    marginRight: spacing.lg,
  },
  likesText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  captionText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },
  captionUsername: {
    fontFamily: typography.semiBold,
    fontWeight: '600',
  },
  viewComments: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  timestamp: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  // AI styles
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  aiBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: typography.semiBold,
    fontWeight: '600',
  },
  aiDetailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  aiDetailsToggleText: {
    color: '#8B5CF6',
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
  },
  aiDetailsContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  aiDetailRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  aiDetailLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    width: 70,
  },
  aiDetailValue: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.text,
    flex: 1,
    lineHeight: 16,
  },
  aiTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.sm,
  },
  aiTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  aiTagText: {
    fontSize: 10,
    fontFamily: typography.medium,
    color: '#8B5CF6',
  },
  aiSettingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  aiSettingChip: {
    fontSize: 10,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  // Remix styles
  remixBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
    gap: 4,
  },
  remixBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  remixBadgeUsername: {
    fontFamily: typography.semiBold,
    color: '#8B5CF6',
  },
  remixCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
    gap: 4,
  },
  remixCountText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: '#8B5CF6',
  },
});

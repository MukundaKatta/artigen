import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { RichText } from '@/components/shared/RichText';
import { ReactionPicker } from '@/components/feed/ReactionPicker';
import { ReactionSummary } from '@/components/feed/ReactionSummary';
import { CollaboratorAvatars } from '@/components/feed/CollaboratorAvatars';
import { PostInsightsButton } from '@/components/feed/PostInsights';
import { PostCardHeader } from '@/components/feed/PostCardHeader';
import { PostCardMedia } from '@/components/feed/PostCardMedia';
import { PostCardActions } from '@/components/feed/PostCardActions';
import { PostCardAiDetails } from '@/components/feed/PostCardAiDetails';
import { useTheme } from '@/providers/ThemeProvider';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';
import { timeAgo } from '@/utils/format-date';
import type { FeedPost, ReactionType } from '@/types';
import { arePostsEqual } from './PostCard.equality';

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
  const { themeColors: tc } = useTheme();
  const [captionExpanded, setCaptionExpanded] = useState(false);
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

  const handleToggleAiDetails = useCallback(() => {
    setShowAiDetails((prev) => !prev);
  }, []);

  const sortedMedia = useMemo(
    () => [...(post.media || [])].sort((a, b) => a.sort_order - b.sort_order),
    [post.media]
  );

  return (
    <View style={[styles.container, { backgroundColor: tc.background, borderBottomColor: tc.border }]}>
      {/* Header */}
      <PostCardHeader
        post={post}
        onUserPress={onUserPress}
        onMore={handleMore}
      />

      {/* Remix badge */}
      {post.remixOf && (
        <AnimatedPressable
          style={styles.remixBadge}
          onPress={() => onPostPress(post.remixOf!.id)}
          scaleValue={0.97}
          accessibilityRole="link"
          accessibilityLabel={`Remixed from ${post.remixOf!.user.username}`}
        >
          <Ionicons name="git-branch-outline" size={12} color={colors.accent} />
          <Text style={styles.remixBadgeText}>
            Remixed from <Text style={styles.remixBadgeUsername}>@{post.remixOf.user.username}</Text>
          </Text>
        </AnimatedPressable>
      )}

      {/* Image / Carousel */}
      <PostCardMedia
        media={sortedMedia}
        onDoubleTap={handleDoubleTap}
        heartStyle={heartStyle}
        altText={post.caption?.trim() || post.ai_metadata?.prompt || `Post by @${post.user.username}`}
      />

      {/* Collaborators */}
      {post.collaborators && post.collaborators.length > 0 && (
        <CollaboratorAvatars collaborators={post.collaborators} />
      )}

      {/* Actions */}
      <PostCardActions
        post={post}
        currentUserId={currentUserId}
        onLike={handleLike}
        onComment={onComment}
        onShare={onShare}
        onRemix={onRemix}
        onTip={onTip}
        onSave={handleSave}
        onSaveToCollection={onSaveToCollection}
        likeButtonStyle={likeButtonStyle}
        saveButtonStyle={saveButtonStyle}
        onLongPressLike={handleLongPressLike}
        onLongPressSave={handleLongPressSave}
        router={router}
      />

      {/* Reaction Summary or Likes */}
      {post.reactionSummary && post.reactionSummary.length > 0 ? (
        <ReactionSummary summary={post.reactionSummary} totalCount={post.likes_count} />
      ) : post.likes_count > 0 ? (
        <Text style={[styles.likesText, { color: tc.text }]}>
          {formatNumber(post.likes_count)} {post.likes_count === 1 ? 'like' : 'likes'}
        </Text>
      ) : null}

      {/* Remix count */}
      {post.remixCount != null && post.remixCount > 0 && (
        <AnimatedPressable
          onPress={() => router.push(`/(screens)/remixes/${post.id}`)}
          style={styles.remixCountRow}
          scaleValue={0.97}
          accessibilityRole="link"
          accessibilityLabel={`${post.remixCount} ${post.remixCount === 1 ? 'remix' : 'remixes'}, tap to view`}
        >
          <Ionicons name="git-branch-outline" size={14} color={colors.accent} />
          <Text style={styles.remixCountText}>
            {post.remixCount} {post.remixCount === 1 ? 'remix' : 'remixes'}
          </Text>
        </AnimatedPressable>
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
        <Pressable
          onPress={() => setCaptionExpanded(!captionExpanded)}
          accessibilityRole="button"
          accessibilityLabel={captionExpanded ? 'Collapse caption' : 'Expand caption'}
        >
          <RichText
            style={[styles.captionText, { color: tc.text }]}
            numberOfLines={captionExpanded ? undefined : 2}
            username={post.user.username}
          >
            {post.caption}
          </RichText>
        </Pressable>
      ) : null}

      {/* AI Details */}
      {post.ai_metadata && (
        <PostCardAiDetails
          aiMetadata={post.ai_metadata}
          showDetails={showAiDetails}
          onToggleDetails={handleToggleAiDetails}
          onPromptRemix={onPromptRemix}
          postId={post.id}
        />
      )}

      {/* View comments link */}
      {post.comments_count > 0 && (
        <Pressable onPress={() => onComment(post.id)} accessibilityRole="link" accessibilityLabel={`View all ${post.comments_count} comments`}>
          <Text style={[styles.viewComments, { color: tc.textSecondary }]}>
            View all {formatNumber(post.comments_count)} comments
          </Text>
        </Pressable>
      )}

      {/* Timestamp */}
      <Text style={[styles.timestamp, { color: tc.textSecondary }]}>{timeAgo(post.created_at)}</Text>

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
}, arePostsEqual);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
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
    color: colors.accent,
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
    color: colors.accent,
  },
});

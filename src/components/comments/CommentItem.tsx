import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { showConfirm } from '@/utils/alert';
import { Avatar } from '@/components/ui/Avatar';
import { colors, fontSize, spacing, typography } from '@/lib/theme';
import { timeAgo } from '@/utils/format-date';
import { formatNumber } from '@/utils/format-number';
import type { CommentWithUser } from '@/types';

type Props = {
  comment: CommentWithUser;
  currentUserId: string;
  onUserPress: (userId: string) => void;
  onDelete?: () => void;
  onLike?: () => void;
  onReply?: (commentId: string, username: string) => void;
  onViewReplies?: (commentId: string) => void;
  isReply?: boolean;
  replies?: CommentWithUser[];
  renderReply?: (reply: CommentWithUser) => React.ReactNode;
};

export function CommentItem({
  comment,
  currentUserId,
  onUserPress,
  onDelete,
  onLike,
  onReply,
  onViewReplies,
  isReply = false,
  replies,
  renderReply,
}: Props) {
  const likeScale = useSharedValue(1);

  const likeButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  function handleLongPress() {
    if (comment.user_id === currentUserId && onDelete) {
      showConfirm('Delete Comment', 'Are you sure?', onDelete);
    }
  }

  const handleLike = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    likeScale.value = withSequence(
      withSpring(1.4, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 6, stiffness: 300 })
    );
    onLike?.();
  }, [onLike, likeScale]);

  const repliesCount = comment.replies_count || 0;
  const showRepliesSection = !isReply && repliesCount > 0;

  return (
    <View style={isReply ? styles.replyContainer : undefined}>
      <TouchableOpacity
        onLongPress={handleLongPress}
        activeOpacity={0.8}
        style={styles.container}
      >
        <Avatar
          uri={comment.user.avatar_url}
          size="sm"
          onPress={() => onUserPress(comment.user.id)}
        />
        <View style={styles.content}>
          <Text style={styles.text}>
            <Text
              style={styles.username}
              onPress={() => onUserPress(comment.user.id)}
            >
              {comment.user.username}
            </Text>
            {'  '}
            {comment.content}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.timestamp}>{timeAgo(comment.created_at)}</Text>
            {(comment.likes_count || 0) > 0 && (
              <Text style={styles.likesCount}>
                {formatNumber(comment.likes_count || 0)} {comment.likes_count === 1 ? 'like' : 'likes'}
              </Text>
            )}
            {!isReply && onReply && (
              <TouchableOpacity onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                onReply(comment.id, comment.user.username);
              }}>
                <Text style={styles.replyButton}>Reply</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={handleLike} hitSlop={8} style={styles.likeButton}>
          <Animated.View style={likeButtonStyle}>
            <Ionicons
              name={comment.isLiked ? 'heart' : 'heart-outline'}
              size={14}
              color={comment.isLiked ? colors.like : colors.textSecondary}
            />
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Replies section */}
      {showRepliesSection && !replies && onViewReplies && (
        <TouchableOpacity
          onPress={() => onViewReplies(comment.id)}
          style={styles.viewRepliesButton}
        >
          <View style={styles.repliesLine} />
          <Text style={styles.viewRepliesText}>
            View {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
          </Text>
        </TouchableOpacity>
      )}

      {replies && replies.length > 0 && renderReply && (
        <View style={styles.repliesContainer}>
          {replies.map(renderReply)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  replyContainer: {
    marginLeft: 48,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  text: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 20,
  },
  username: {
    fontFamily: typography.semiBold,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.md,
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  likesCount: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.semiBold,
    fontWeight: '600',
  },
  replyButton: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.semiBold,
    fontWeight: '600',
  },
  likeButton: {
    paddingLeft: spacing.sm,
    paddingTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  viewRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 48 + spacing.lg,
    paddingVertical: spacing.xs,
  },
  repliesLine: {
    width: 24,
    height: 1,
    backgroundColor: colors.textSecondary,
    marginRight: spacing.sm,
  },
  viewRepliesText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.semiBold,
    fontWeight: '600',
  },
  repliesContainer: {
    marginTop: spacing.xs,
  },
});

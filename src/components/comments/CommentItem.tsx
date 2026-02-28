import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { showConfirm } from '@/utils/alert';
import { Avatar } from '@/components/ui/Avatar';
import { colors, fontSize, spacing, typography } from '@/lib/theme';
import { timeAgo } from '@/utils/format-date';
import type { CommentWithUser } from '@/types';

type Props = {
  comment: CommentWithUser;
  currentUserId: string;
  onUserPress: (userId: string) => void;
  onDelete?: () => void;
};

export function CommentItem({
  comment,
  currentUserId,
  onUserPress,
  onDelete,
}: Props) {
  function handleLongPress() {
    if (comment.user_id === currentUserId && onDelete) {
      showConfirm('Delete Comment', 'Are you sure?', onDelete);
    }
  }

  return (
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
        <Text style={styles.timestamp}>{timeAgo(comment.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
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
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useAuth } from '@/providers/AuthProvider';
import { useComments } from '@/hooks/useComments';
import { CommentItem } from '@/components/comments/CommentItem';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { commentSchema } from '@/utils/validation';
import type { CommentFormData } from '@/utils/validation';
import { colors, fontSize, spacing, typography } from '@/lib/theme';
import type { CommentWithUser } from '@/types';

export default function CommentsRoute() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { user, profile } = useAuth();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; username: string } | null>(null);

  const {
    comments,
    repliesMap,
    loading,
    loadingMore,
    submitting,
    hasMore,
    loadMore,
    submitComment,
    submitReply,
    removeComment,
    toggleCommentLike,
    loadReplies,
    initWithUserId,
  } = useComments(postId!);

  useEffect(() => {
    if (user?.id) {
      initWithUserId(user.id);
    }
  }, [user?.id, initWithUserId]);

  const { control, handleSubmit, reset, setValue } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  });

  function handleReply(commentId: string, username: string) {
    setReplyingTo({ commentId, username });
    setValue('content', `@${username} `);
    inputRef.current?.focus();
  }

  function cancelReply() {
    setReplyingTo(null);
    setValue('content', '');
  }

  async function onSubmit(data: CommentFormData) {
    if (!user?.id) return;

    if (replyingTo) {
      const { error } = await submitReply(user.id, data.content, replyingTo.commentId);
      if (!error) {
        reset();
        setReplyingTo(null);
        inputRef.current?.blur();
      }
    } else {
      const { error } = await submitComment(user.id, data.content);
      if (!error) {
        reset();
        inputRef.current?.blur();
      }
    }
  }

  function renderReply(reply: CommentWithUser) {
    return (
      <CommentItem
        key={reply.id}
        comment={reply}
        currentUserId={user?.id || ''}
        onUserPress={(userId) => router.push(`/(screens)/user/${userId}`)}
        onDelete={
          reply.user_id === user?.id ? () => removeComment(reply.id) : undefined
        }
        onLike={() => user?.id && toggleCommentLike(user.id, reply.id)}
        isReply
      />
    );
  }

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeIn.delay(Math.min(index, 8) * 30).duration(250)}>
            <CommentItem
              comment={item}
              currentUserId={user?.id || ''}
              onUserPress={(userId) =>
                router.push(`/(screens)/user/${userId}`)
              }
              onDelete={
                item.user_id === user?.id
                  ? () => removeComment(item.id)
                  : undefined
              }
              onLike={() => user?.id && toggleCommentLike(user.id, item.id)}
              onReply={handleReply}
              onViewReplies={loadReplies}
              replies={repliesMap[item.id]}
              renderReply={renderReply}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="chatbubble-outline" size={28} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No comments yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to comment!</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={{ padding: spacing.lg }}><LoadingSpinner /></View>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.list}
      />

      {/* Replying indicator */}
      {replyingTo && (
        <View style={styles.replyingBar}>
          <Text style={styles.replyingText}>
            Replying to <Text style={styles.replyingUsername}>@{replyingTo.username}</Text>
          </Text>
          <AnimatedPressable onPress={cancelReply} scaleValue={0.85}>
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </AnimatedPressable>
        </View>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <Avatar uri={profile?.avatar_url} size="sm" />
        <Controller
          control={control}
          name="content"
          render={({ field: { onChange, value } }) => (
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : 'Add a comment...'}
              placeholderTextColor={colors.textSecondary}
              value={value}
              onChangeText={onChange}
              multiline
            />
          )}
        />
        <AnimatedPressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleSubmit(onSubmit)();
          }}
          scaleValue={0.9}
        >
          <Text
            style={[
              styles.postButton,
              submitting && styles.postButtonDisabled,
            ]}
          >
            Post
          </Text>
        </AnimatedPressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flexGrow: 1,
    paddingVertical: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  replyingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  replyingText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  replyingUsername: {
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    marginHorizontal: spacing.md,
    maxHeight: 80,
    paddingVertical: spacing.xs,
  },
  postButton: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
});

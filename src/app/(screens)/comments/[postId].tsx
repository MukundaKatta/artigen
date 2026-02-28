import React, { useRef } from 'react';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/providers/AuthProvider';
import { useComments } from '@/hooks/useComments';
import { CommentItem } from '@/components/comments/CommentItem';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { commentSchema } from '@/utils/validation';
import type { CommentFormData } from '@/utils/validation';
import { colors, fontSize, spacing, typography } from '@/lib/theme';

export default function CommentsRoute() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { user, profile } = useAuth();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const {
    comments,
    loading,
    loadingMore,
    submitting,
    hasMore,
    loadMore,
    submitComment,
    removeComment,
  } = useComments(postId!);

  const { control, handleSubmit, reset } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  });

  async function onSubmit(data: CommentFormData) {
    if (!user?.id) return;
    const { error } = await submitComment(user.id, data.content);
    if (!error) {
      reset();
      inputRef.current?.blur();
    }
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
        renderItem={({ item }) => (
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
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No comments yet. Be the first!</Text>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              style={{ padding: spacing.lg }}
              color={colors.textSecondary}
            />
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.list}
      />

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
              placeholder="Add a comment..."
              placeholderTextColor={colors.textSecondary}
              value={value}
              onChangeText={onChange}
              multiline
            />
          )}
        />
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
        >
          <Text
            style={[
              styles.postButton,
              submitting && styles.postButtonDisabled,
            ]}
          >
            Post
          </Text>
        </TouchableOpacity>
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
  empty: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xxxl,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 0.5,
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

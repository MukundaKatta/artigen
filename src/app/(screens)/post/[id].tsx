import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import {
  getPost,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  deletePost,
} from '@/services/post.service';
import { getComments } from '@/services/comment.service';
import { PostCard } from '@/components/feed/PostCard';
import { CommentItem } from '@/components/comments/CommentItem';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, spacing, fontSize } from '@/lib/theme';
import type { FeedPost, CommentWithUser } from '@/types';

export default function PostRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user?.id) return;

    async function fetchData() {
      setLoading(true);
      const [postResult, commentsResult] = await Promise.all([
        getPost(id!, user!.id),
        getComments(id!, 0),
      ]);
      setPost(postResult.data);
      setComments(commentsResult.data);
      setLoading(false);
    }

    fetchData();
  }, [id, user?.id]);

  const handleToggleLike = useCallback(async () => {
    if (!post || !user?.id) return;
    const wasLiked = post.isLiked;

    setPost((prev) =>
      prev
        ? {
            ...prev,
            isLiked: !wasLiked,
            likes_count: wasLiked
              ? prev.likes_count - 1
              : prev.likes_count + 1,
          }
        : prev
    );

    const { error } = wasLiked
      ? await unlikePost(user.id, post.id)
      : await likePost(user.id, post.id);

    if (error) {
      setPost((prev) =>
        prev
          ? {
              ...prev,
              isLiked: wasLiked,
              likes_count: wasLiked
                ? prev.likes_count + 1
                : prev.likes_count - 1,
            }
          : prev
      );
    }
  }, [post, user?.id]);

  const handleToggleSave = useCallback(async () => {
    if (!post || !user?.id) return;
    const wasSaved = post.isSaved;

    setPost((prev) => (prev ? { ...prev, isSaved: !wasSaved } : prev));

    const { error } = wasSaved
      ? await unsavePost(user.id, post.id)
      : await savePost(user.id, post.id);

    if (error) {
      setPost((prev) => (prev ? { ...prev, isSaved: wasSaved } : prev));
    }
  }, [post, user?.id]);

  const handleDelete = useCallback(
    async (postId: string) => {
      await deletePost(postId);
      router.back();
    },
    [router]
  );

  if (loading) return <LoadingSpinner fullScreen />;

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={comments}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <PostCard
          post={post}
          currentUserId={user?.id || ''}
          onLike={() => handleToggleLike()}
          onSave={() => handleToggleSave()}
          onComment={() => router.push(`/(screens)/comments/${id}`)}
          onUserPress={(userId) => router.push(`/(screens)/user/${userId}`)}
          onPostPress={() => {}}
          onDelete={post.user_id === user?.id ? handleDelete : undefined}
        />
      }
      renderItem={({ item }) => (
        <CommentItem
          comment={item}
          currentUserId={user?.id || ''}
          onUserPress={(userId) => router.push(`/(screens)/user/${userId}`)}
        />
      )}
      ListEmptyComponent={
        <Text style={styles.noComments}>No comments yet</Text>
      }
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  noComments: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});

import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
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
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import { SCREEN_WIDTH } from '@/lib/constants';
import type { FeedPost, CommentWithUser } from '@/types';

function PostSkeleton() {
  return (
    <View>
      <View style={styles.skeletonHeader}>
        <Skeleton width={36} height={36} borderRadius={18} />
        <View style={{ marginLeft: spacing.sm }}>
          <Skeleton width={120} height={14} />
          <Skeleton width={60} height={10} style={{ marginTop: 4 }} />
        </View>
      </View>
      <Skeleton width={SCREEN_WIDTH} height={SCREEN_WIDTH} borderRadius={0} />
      <View style={styles.skeletonActions}>
        <Skeleton width={80} height={26} borderRadius={4} />
        <Skeleton width={80} height={26} borderRadius={4} />
      </View>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <Skeleton width={200} height={14} />
        <Skeleton width={160} height={12} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

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

  if (loading) return <PostSkeleton />;

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
        </View>
        <Text style={styles.errorText}>Post not found</Text>
        <Text style={styles.errorSubtext}>It may have been removed</Text>
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
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeIn.delay(Math.min(index, 8) * 30).duration(250)}>
          <CommentItem
            comment={item}
            currentUserId={user?.id || ''}
            onUserPress={(userId) => router.push(`/(screens)/user/${userId}`)}
          />
        </Animated.View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyComments}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="chatbubble-outline" size={24} color={colors.textSecondary} />
          </View>
          <Text style={styles.noComments}>No comments yet</Text>
          <Text style={styles.noCommentsHint}>Be the first to comment</Text>
        </View>
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
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  skeletonActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    padding: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
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
  errorText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  errorSubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  noComments: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
    textAlign: 'center',
  },
  noCommentsHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

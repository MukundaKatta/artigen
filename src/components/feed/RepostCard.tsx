import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { SCREEN_WIDTH } from '@/lib/constants';
import { timeAgo } from '@/utils/format-date';
import { sortMediaByOrder } from '@/utils/media';
import type { FeedPost, Profile, PostMedia } from '@/types';

type RepostCardProps = {
  reposter: Pick<Profile, 'id' | 'username' | 'avatar_url'>;
  quoteText?: string | null;
  post: FeedPost;
  onUserPress: (userId: string) => void;
  onPostPress: (postId: string) => void;
};

const PURPLE = colors.accent;

export const RepostCard = React.memo(function RepostCard({
  reposter,
  quoteText,
  post,
  onUserPress,
  onPostPress,
}: RepostCardProps) {
  const firstMedia: PostMedia | undefined = useMemo(() => sortMediaByOrder(post.media)[0], [post.media]);

  return (
    <View style={styles.container}>
      {/* Repost attribution */}
      <TouchableOpacity
        style={styles.repostHeader}
        onPress={() => onUserPress(reposter.id)}
      >
        <Ionicons name="repeat" size={14} color={PURPLE} />
        <Text style={styles.repostHeaderText}>
          <Text style={styles.repostUsername}>@{reposter.username}</Text> reposted
        </Text>
      </TouchableOpacity>

      {/* Optional quote text */}
      {quoteText ? (
        <Text style={styles.quoteText}>{quoteText}</Text>
      ) : null}

      {/* Nested post preview */}
      <TouchableOpacity
        style={styles.nestedPost}
        onPress={() => onPostPress(post.id)}
        activeOpacity={0.85}
      >
        {/* Original poster header */}
        <View style={styles.nestedHeader}>
          <TouchableOpacity
            style={styles.nestedHeaderLeft}
            onPress={() => onUserPress(post.user.id)}
          >
            <Avatar uri={post.user.avatar_url} size="sm" />
            <Text style={styles.nestedUsername}>{post.user.username}</Text>
          </TouchableOpacity>
          <Text style={styles.nestedTimestamp}>{timeAgo(post.created_at)}</Text>
        </View>

        {/* Thumbnail */}
        {firstMedia && (
          <Image
            source={{ uri: firstMedia.media_url }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
          />
        )}

        {/* Caption snippet */}
        {post.caption ? (
          <Text style={styles.captionSnippet} numberOfLines={2}>
            {post.caption}
          </Text>
        ) : null}
      </TouchableOpacity>
    </View>
  );
});

const NESTED_IMAGE_WIDTH = SCREEN_WIDTH - spacing.lg * 2 - spacing.md * 2;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  repostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  repostHeaderText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  repostUsername: {
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: PURPLE,
  },
  quoteText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    lineHeight: 20,
  },
  nestedPost: {
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
  },
  nestedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  nestedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nestedUsername: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  nestedTimestamp: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  thumbnail: {
    width: NESTED_IMAGE_WIDTH,
    height: NESTED_IMAGE_WIDTH * 0.75,
  },
  captionSnippet: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    lineHeight: 18,
  },
});

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { TipButton } from '@/components/feed/TipButton';
import { ProvenanceBadge } from '@/components/feed/ProvenanceBadge';
import { useTheme } from '@/providers/ThemeProvider';
import { colors, spacing } from '@/lib/theme';
import type { FeedPost } from '@/types';
import type { Router } from 'expo-router';
import type { StyleProp, ViewStyle } from 'react-native';

type PostCardActionsProps = {
  post: FeedPost;
  currentUserId: string;
  onLike: () => void;
  onComment: (postId: string) => void;
  onShare?: (postId: string) => void;
  onRemix?: (postId: string) => void;
  onTip?: (postId: string, recipientId: string) => void;
  onSave: () => void;
  onSaveToCollection?: (postId: string) => void;
  likeButtonStyle: StyleProp<ViewStyle>;
  saveButtonStyle: StyleProp<ViewStyle>;
  onLongPressLike: () => void;
  onLongPressSave: () => void;
  router: Router;
};

export const PostCardActions = React.memo(function PostCardActions({
  post,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onRemix,
  onTip,
  onSave,
  onSaveToCollection,
  likeButtonStyle,
  saveButtonStyle,
  onLongPressLike,
  onLongPressSave,
  router,
}: PostCardActionsProps) {
  const { themeColors: tc } = useTheme();
  return (
    <View style={styles.actions}>
      <View style={styles.actionsLeft}>
        <AnimatedPressable
          onPress={onLike}
          onLongPress={onLongPressLike}
          hitSlop={12}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel={post.isLiked ? 'Unlike post' : 'Like post'}
          accessibilityState={{ selected: post.isLiked }}
          scaleValue={0.85}
        >
          <Animated.View style={likeButtonStyle}>
            <Ionicons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={26}
              color={post.isLiked ? colors.like : tc.text}
            />
          </Animated.View>
        </AnimatedPressable>
        <AnimatedPressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            onComment(post.id);
          }}
          hitSlop={8}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel={`Comment on post, ${post.comments_count} comments`}
          scaleValue={0.85}
        >
          <Ionicons
            name="chatbubble-outline"
            size={24}
            color={tc.text}
          />
        </AnimatedPressable>
        <AnimatedPressable
          hitSlop={8}
          style={styles.actionButton}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            onShare?.(post.id);
          }}
          accessibilityRole="button"
          accessibilityLabel="Share post"
          scaleValue={0.85}
        >
          <Ionicons
            name="paper-plane-outline"
            size={24}
            color={tc.text}
          />
        </AnimatedPressable>
        {post.ai_metadata && onRemix && (
          <AnimatedPressable
            hitSlop={8}
            style={styles.actionButton}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              onRemix(post.id);
            }}
            scaleValue={0.85}
            accessibilityRole="button"
            accessibilityLabel="Remix this post"
          >
            <Ionicons
              name="git-branch-outline"
              size={24}
              color={colors.accent}
            />
          </AnimatedPressable>
        )}
        {onTip && post.user_id !== currentUserId && (
          <TipButton onPress={() => onTip(post.id, post.user_id)} />
        )}
      </View>
      <View style={styles.actionsRight}>
        {post.has_provenance && (
          <ProvenanceBadge onPress={() => router.push(`/(screens)/provenance/${post.id}`)} />
        )}
        <AnimatedPressable
          onPress={onSave}
          onLongPress={onLongPressSave}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={post.isSaved ? 'Unsave post' : 'Save post'}
          accessibilityState={{ selected: post.isSaved }}
          scaleValue={0.85}
        >
          <Animated.View style={saveButtonStyle}>
            <Ionicons
              name={post.isSaved ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={tc.text}
            />
          </Animated.View>
        </AnimatedPressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
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
});

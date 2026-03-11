import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Avatar } from '@/components/ui/Avatar';
import { LocationTag } from '@/components/feed/LocationTag';
import { useTheme } from '@/providers/ThemeProvider';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import type { FeedPost } from '@/types';

type PostCardHeaderProps = {
  post: FeedPost;
  onUserPress: (userId: string) => void;
  onMore: () => void;
};

export const PostCardHeader = React.memo(function PostCardHeader({
  post,
  onUserPress,
  onMore,
}: PostCardHeaderProps) {
  const { themeColors: tc } = useTheme();
  return (
    <View style={styles.header}>
      <AnimatedPressable
        style={styles.headerLeft}
        onPress={() => onUserPress(post.user.id)}
        scaleValue={0.97}
        accessibilityRole="button"
        accessibilityLabel={`View ${post.user.username}'s profile`}
      >
        <Avatar uri={post.user.avatar_url} size="sm" />
        <View style={styles.headerText}>
          <View style={styles.usernameRow}>
            <Text style={[styles.username, { color: tc.text }]}>{post.user.username}</Text>
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
      </AnimatedPressable>
      <AnimatedPressable onPress={onMore} hitSlop={8} scaleValue={0.9} accessibilityRole="button" accessibilityLabel="More options">
        <Ionicons
          name="ellipsis-horizontal"
          size={20}
          color={tc.text}
        />
      </AnimatedPressable>
    </View>
  );
});

const styles = StyleSheet.create({
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
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  username: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
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
});

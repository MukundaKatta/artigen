import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { Avatar } from '@/components/ui/Avatar';
import { UserRowSkeleton } from '@/components/ui/Skeleton';
import { timeAgo } from '@/utils/format-date';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import type { NotificationWithSender } from '@/types';

function getNotificationText(n: NotificationWithSender): string {
  switch (n.notification_type) {
    case 'like':
      return 'liked your post.';
    case 'comment':
      return 'commented on your post.';
    case 'follow':
      return 'started following you.';
    case 'follow_request':
      return 'requested to follow you.';
    case 'mention':
      return 'mentioned you in a comment.';
    case 'story_reply':
      return 'replied to your story.';
    case 'comment_like':
      return 'liked your comment.';
    case 'collab_invite':
      return 'invited you to collaborate on a post.';
    case 'collab_accepted':
      return 'accepted your collaboration invite.';
    default:
      return 'interacted with you.';
  }
}

export default function NotificationsRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    notifications,
    loading,
    loadingMore,
    hasMore,
    refresh,
    loadMore,
    markRead,
    markAll,
  } = useNotifications(user?.id);

  function handlePress(n: NotificationWithSender) {
    if (!n.is_read) markRead(n.id);

    if (n.notification_type === 'collab_invite') {
      router.push('/(screens)/collab-invite');
      return;
    }
    if (n.notification_type === 'follow' || n.notification_type === 'follow_request') {
      router.push(`/(screens)/user/${n.sender_id}`);
    } else if (n.post_id) {
      router.push(`/(screens)/post/${n.post_id}`);
    } else {
      router.push(`/(screens)/user/${n.sender_id}`);
    }
  }

  function renderItem({ item, index }: { item: NotificationWithSender; index: number }) {
    return (
      <Animated.View entering={FadeInRight.delay(Math.min(index, 9) * 30).duration(250)}>
        <TouchableOpacity
          style={[styles.row, !item.is_read && styles.unreadRow]}
          onPress={() => handlePress(item)}
        >
          <Avatar uri={item.sender?.avatar_url} size="md" />
          <View style={styles.content}>
            <Text style={styles.text}>
              <Text style={styles.username}>{item.sender?.username}</Text>
              {' '}
              {getNotificationText(item)}
            </Text>
            <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerShown: true,
          headerTitleStyle: { fontFamily: typography.semiBold },
          headerRight: () =>
            notifications.some((n) => !n.is_read) ? (
              <TouchableOpacity onPress={markAll} hitSlop={8}>
                <Text style={styles.markAll}>Mark all read</Text>
              </TouchableOpacity>
            ) : null,
        }}
      />

      {loading ? (
        <View style={{ paddingTop: spacing.sm }}>
          {[...Array(5)].map((_, i) => <UserRowSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshing={false}
          onRefresh={refresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ padding: spacing.lg }}>
                <UserRowSkeleton />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-outline" size={48} color={colors.border} />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyText}>
                When someone interacts with you, you'll see it here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  unreadRow: {
    backgroundColor: colors.notificationUnread,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  text: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 20,
  },
  username: {
    fontFamily: typography.semiBold,
    fontWeight: '600',
  },
  time: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  markAll: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.primary,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

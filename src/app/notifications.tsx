import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { Avatar } from '@/components/ui/Avatar';
import { UserRowSkeleton } from '@/components/ui/Skeleton';
import { timeAgo } from '@/utils/format-date';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import type { NotificationWithSender } from '@/types';

function getNotificationIcon(type: string): { name: string; color: string } {
  switch (type) {
    case 'like':
    case 'comment_like':
      return { name: 'heart', color: colors.like };
    case 'comment':
    case 'mention':
      return { name: 'chatbubble', color: colors.primary };
    case 'follow':
    case 'follow_request':
      return { name: 'person-add', color: '#8B5CF6' };
    case 'story_reply':
      return { name: 'albums', color: '#F59E0B' };
    case 'collab_invite':
    case 'collab_accepted':
      return { name: 'people', color: '#10B981' };
    default:
      return { name: 'notifications', color: colors.textSecondary };
  }
}

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

function groupNotifications(notifications: NotificationWithSender[]) {
  const now = Date.now();
  const dayMs = 86400000;
  const weekMs = dayMs * 7;

  const today: NotificationWithSender[] = [];
  const thisWeek: NotificationWithSender[] = [];
  const earlier: NotificationWithSender[] = [];

  for (const n of notifications) {
    const age = now - new Date(n.created_at).getTime();
    if (age < dayMs) today.push(n);
    else if (age < weekMs) thisWeek.push(n);
    else earlier.push(n);
  }

  const sections = [];
  if (today.length > 0) sections.push({ title: 'Today', data: today });
  if (thisWeek.length > 0) sections.push({ title: 'This Week', data: thisWeek });
  if (earlier.length > 0) sections.push({ title: 'Earlier', data: earlier });

  return sections;
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

  const sections = useMemo(() => groupNotifications(notifications), [notifications]);

  function handlePress(n: NotificationWithSender) {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
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
    const icon = getNotificationIcon(item.notification_type);

    return (
      <Animated.View entering={FadeInRight.delay(Math.min(index, 9) * 30).duration(250)}>
        <TouchableOpacity
          style={[styles.row, !item.is_read && styles.unreadRow]}
          onPress={() => handlePress(item)}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel={`${item.sender?.username} ${getNotificationText(item)}`}
        >
          <View style={styles.avatarContainer}>
            <Avatar uri={item.sender?.avatar_url} size="md" />
            <View style={[styles.notifIconBadge, { backgroundColor: icon.color }]}>
              <Ionicons name={icon.name as any} size={10} color="#fff" />
            </View>
          </View>
          <View style={styles.content}>
            <Text style={styles.text}>
              <Text style={styles.username}>{item.sender?.username}</Text>
              {' '}
              {getNotificationText(item)}
            </Text>
            <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
          </View>
          {!item.is_read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  function renderSectionHeader({ section }: { section: { title: string } }) {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
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
              <TouchableOpacity onPress={markAll} hitSlop={8} accessibilityRole="button" accessibilityLabel="Mark all as read">
                <Text style={styles.markAll}>Mark all read</Text>
              </TouchableOpacity>
            ) : null,
        }}
      />

      {loading ? (
        <View style={{ paddingTop: spacing.sm }}>
          {[...Array(6)].map((_, i) => <UserRowSkeleton key={i} />)}
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="notifications-outline" size={32} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyText}>
            When someone interacts with you, you'll see it here
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          refreshing={false}
          onRefresh={refresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          stickySectionHeadersEnabled={false}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ padding: spacing.lg }}>
                <UserRowSkeleton />
              </View>
            ) : null
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
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  sectionHeaderText: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  unreadRow: {
    backgroundColor: colors.notificationUnread,
  },
  avatarContainer: {
    position: 'relative',
  },
  notifIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
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
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
  markAll: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.primary,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: spacing.xxxl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

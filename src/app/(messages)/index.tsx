import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useConversations } from '@/hooks/useConversations';
import { useNotes } from '@/hooks/useNotes';
import { Avatar } from '@/components/ui/Avatar';
import { GroupAvatar } from '@/components/messages/GroupAvatar';
import { NotesRow } from '@/components/messages/NotesRow';
import { OnlineIndicator } from '@/components/ui/OnlineIndicator';
import { timeAgo } from '@/utils/format-date';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import { UserRowSkeleton } from '@/components/ui/Skeleton';
import type { ConversationPreview } from '@/types';

export default function MessagesIndexRoute() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { conversations, loading, refresh } = useConversations(user?.id);
  const { notes, myNote, shareNote, removeNote } = useNotes(user?.id);

  function getOtherParticipant(conv: ConversationPreview) {
    return conv.participants.find((p) => p.id !== user?.id) || conv.participants[0];
  }

  function renderItem({ item }: { item: ConversationPreview }) {
    const isGroup = item.is_group;
    const other = getOtherParticipant(item);

    if (!isGroup && !other) return null;

    const displayName = isGroup
      ? item.group_name || 'Group'
      : other!.username;

    const avatarSection = isGroup ? (
      <GroupAvatar
        avatarUrls={item.participants.map((p) => p.avatar_url)}
        size={48}
      />
    ) : (
      <Avatar uri={other!.avatar_url} size="lg" />
    );

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push(`/(messages)/${item.id}`)}
      >
        {avatarSection}
        <View style={styles.info}>
          <Text style={styles.username}>{displayName}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            {!isGroup && other?.show_activity_status && (
              <OnlineIndicator lastActiveAt={other?.last_active_at} showText />
            )}
            {!(!isGroup && other?.show_activity_status && other?.last_active_at) && (
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage?.content || 'No messages yet'}
                {item.lastMessage ? ` · ${timeAgo(item.lastMessage.created_at)}` : ''}
              </Text>
            )}
          </View>
        </View>
        {item.unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Messages',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(messages)/new')}
              hitSlop={8}
            >
              <Ionicons name="create-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      {loading ? (
        <View style={{ paddingTop: spacing.sm }}>
          {[...Array(5)].map((_, i) => <UserRowSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshing={false}
          onRefresh={refresh}
          ListHeaderComponent={
            profile ? (
              <NotesRow
                myNote={myNote}
                notes={notes}
                currentUser={{
                  id: profile.id,
                  username: profile.username,
                  avatar_url: profile.avatar_url,
                }}
                onShareNote={shareNote}
                onDeleteNote={removeNote}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.border} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>
                Start a conversation by tapping the compose button
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
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  username: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  lastMessage: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    fontFamily: typography.bold,
    fontWeight: '700',
  },
  loader: {
    marginTop: spacing.xxxl,
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

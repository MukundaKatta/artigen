import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  Pressable,
  Share,
  Platform,
} from 'react-native';
import { impactAsync, selectionAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Avatar } from '@/components/ui/Avatar';
import { colors, fontSize, spacing, typography, borderRadius } from '@/lib/theme';
import { searchUsers } from '@/services/profile.service';
import { getOrCreateConversation, sendMessage } from '@/services/message.service';

type ShareSheetProps = {
  visible: boolean;
  onClose: () => void;
  postId: string;
  currentUserId: string;
  recentConversations?: { userId: string; profile: any }[];
};

export function ShareSheet({
  visible,
  onClose,
  postId,
  currentUserId,
}: ShareSheetProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setUsers([]);
      setSentTo(new Set());
      setSending(null);
    }
  }, [visible]);

  useEffect(() => {
    if (query.length < 2) {
      setUsers([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data } = await searchUsers(query);
      setUsers((data || []).filter((u: any) => u.id !== currentUserId));
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, currentUserId]);

  const handleSend = useCallback(async (targetUserId: string) => {
    setSending(targetUserId);
    const { data: conversation } = await getOrCreateConversation(currentUserId, targetUserId);
    if (conversation) {
      await sendMessage(conversation.id, currentUserId, null, 'post_share', undefined, postId);
    }
    setSentTo((prev) => new Set(prev).add(targetUserId));
    setSending(null);
  }, [currentUserId, postId]);

  const handleExternalShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out this post on Artigen!`,
        url: `artigen://post/${postId}`,
      });
    } catch {}
    onClose();
  }, [postId, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Share</Text>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor={colors.textSecondary}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
          </View>

          {searching && (
            <View style={{ padding: spacing.md }}>
              <LoadingSpinner size="small" color={colors.textSecondary} />
            </View>
          )}

          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={10}
            renderItem={({ item }) => {
              const isSent = sentTo.has(item.id);
              const isSending = sending === item.id;
              return (
                <View style={styles.userRow}>
                  <Avatar uri={item.avatar_url} size="sm" />
                  <View style={styles.userInfo}>
                    <Text style={styles.username}>{item.username}</Text>
                    <Text style={styles.fullName}>{item.full_name}</Text>
                  </View>
                  <AnimatedPressable
                    style={[styles.sendButton, isSent && styles.sentButton]}
                    onPress={() => {
                      if (Platform.OS !== 'web') impactAsync(ImpactFeedbackStyle.Light);
                      handleSend(item.id);
                    }}
                    disabled={isSent || isSending}
                    scaleValue={0.92}
                  >
                    {isSending ? (
                      <ActivityIndicator size="small" color={colors.textLight} />
                    ) : (
                      <Text style={[styles.sendText, isSent && styles.sentText]}>
                        {isSent ? 'Sent' : 'Send'}
                      </Text>
                    )}
                  </AnimatedPressable>
                </View>
              );
            }}
            ListEmptyComponent={
              query.length >= 2 && !searching ? (
                <Text style={styles.emptyText}>No users found</Text>
              ) : null
            }
          />

          {/* External share option */}
          <AnimatedPressable style={styles.externalShare} onPress={() => {
            if (Platform.OS !== 'web') selectionAsync();
            handleExternalShare();
          }} scaleValue={0.97}>
            <Ionicons name="share-outline" size={22} color={colors.text} />
            <Text style={styles.externalShareText}>Share externally...</Text>
          </AnimatedPressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: spacing.xxxl,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  list: {
    maxHeight: 300,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  username: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  fullName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 70,
    alignItems: 'center',
  },
  sentButton: {
    backgroundColor: colors.backgroundSecondary,
  },
  sendText: {
    color: colors.textLight,
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
  },
  sentText: {
    color: colors.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    padding: spacing.lg,
  },
  externalShare: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  externalShareText: {
    fontSize: fontSize.md,
    color: colors.text,
    marginLeft: spacing.md,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useAuth } from '@/providers/AuthProvider';
import { useChat } from '@/hooks/useChat';
import { Avatar } from '@/components/ui/Avatar';
import { getSharedPost } from '@/services/message.service';
import { colors, spacing, fontSize, borderRadius, typography, shadows } from '@/lib/theme';
import type { MessageWithSender } from '@/types';

function TypingIndicator() {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(withSequence(withTiming(-4, { duration: 300 }), withTiming(0, { duration: 300 })), -1);
    setTimeout(() => {
      dot2.value = withRepeat(withSequence(withTiming(-4, { duration: 300 }), withTiming(0, { duration: 300 })), -1);
    }, 150);
    setTimeout(() => {
      dot3.value = withRepeat(withSequence(withTiming(-4, { duration: 300 }), withTiming(0, { duration: 300 })), -1);
    }, 300);
  }, [dot1, dot2, dot3]);

  const s1 = useAnimatedStyle(() => ({ transform: [{ translateY: dot1.value }] }));
  const s2 = useAnimatedStyle(() => ({ transform: [{ translateY: dot2.value }] }));
  const s3 = useAnimatedStyle(() => ({ transform: [{ translateY: dot3.value }] }));

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.typingDot, s1]} />
        <Animated.View style={[styles.typingDot, s2]} />
        <Animated.View style={[styles.typingDot, s3]} />
      </View>
    </View>
  );
}

function SharedPostBubble({ postId, isMine }: { postId: string; isMine: boolean }) {
  const router = useRouter();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    getSharedPost(postId).then(({ data }) => setPost(data));
  }, [postId]);

  if (!post) return <Text style={styles.sharedPostLoading}>Loading post...</Text>;

  const media = (post.media || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
  const firstMedia = media[0];

  return (
    <TouchableOpacity
      style={[styles.sharedPost, isMine ? styles.sharedPostMine : styles.sharedPostTheirs]}
      onPress={() => router.push(`/(screens)/post/${postId}`)}
      activeOpacity={0.8}
    >
      {firstMedia && (
        <Image
          source={{ uri: firstMedia.media_url }}
          style={styles.sharedPostImage}
          contentFit="cover"
        />
      )}
      <View style={styles.sharedPostInfo}>
        <Text style={[styles.sharedPostUsername, isMine && { color: 'rgba(255,255,255,0.9)' }]}>
          {post.user?.username}
        </Text>
        {post.caption ? (
          <Text
            style={[styles.sharedPostCaption, isMine && { color: 'rgba(255,255,255,0.7)' }]}
            numberOfLines={2}
          >
            {post.caption}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function ChatRoute() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    messages,
    loading,
    loadingMore,
    sending,
    hasMore,
    sendMessage,
    loadMore,
    otherLastReadAt,
    isOtherTyping,
    onTyping,
  } = useChat(conversationId, user?.id);
  const [text, setText] = useState('');

  function handleSend() {
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  }

  function handleTextChange(value: string) {
    setText(value);
    onTyping();
  }

  // Find the last message sent by me that has been read by the other person
  const lastSeenMessageId = (() => {
    if (!otherLastReadAt || !user?.id) return null;
    for (const msg of messages) {
      if (msg.sender_id === user.id && msg.created_at <= otherLastReadAt) {
        return msg.id;
      }
    }
    return null;
  })();

  function renderMessage({ item }: { item: MessageWithSender }) {
    const isMine = item.sender_id === user?.id;
    const isPostShare = item.message_type === 'post_share' && item.shared_post_id;
    const isStoryReply = item.message_type === 'story_reply';
    const showSeen = item.id === lastSeenMessageId;

    return (
      <View>
        <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
          {!isMine && <Avatar uri={item.sender?.avatar_url} size="sm" />}
          {isPostShare && item.shared_post_id ? (
            <SharedPostBubble postId={item.shared_post_id} isMine={isMine} />
          ) : (
            <View
              style={[
                styles.bubble,
                isMine ? styles.bubbleMine : styles.bubbleTheirs,
                isStoryReply && styles.storyReplyBubble,
              ]}
            >
              {isStoryReply && (
                <Text style={[styles.storyReplyLabel, isMine && { color: 'rgba(255,255,255,0.6)' }]}>
                  Replied to story
                </Text>
              )}
              <Text
                style={[
                  styles.messageText,
                  isMine && styles.messageTextMine,
                ]}
              >
                {item.content}
              </Text>
            </View>
          )}
        </View>
        {showSeen && (
          <Text style={styles.seenText}>Seen</Text>
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ title: 'Chat' }} />

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.textSecondary} />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.messageList}
          ListHeaderComponent={isOtherTyping ? <TypingIndicator /> : null}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={colors.textSecondary} style={{ padding: spacing.md }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>
                Send a message to start the conversation
              </Text>
            </View>
          }
        />
      )}

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor={colors.textSecondary}
          value={text}
          onChangeText={handleTextChange}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || sending}
          hitSlop={8}
        >
          <Ionicons
            name="send"
            size={24}
            color={text.trim() ? colors.primary : colors.border}
          />
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
  messageList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    ...shadows.sm,
  },
  bubbleTheirs: {
    backgroundColor: colors.backgroundSecondary,
    borderBottomLeftRadius: 4,
    marginLeft: spacing.sm,
  },
  storyReplyBubble: {
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(139, 92, 246, 0.5)',
  },
  storyReplyLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.medium,
    marginBottom: 2,
  },
  messageText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 20,
  },
  messageTextMine: {
    color: colors.textLight,
  },
  seenText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: spacing.xs,
    marginRight: spacing.xs,
  },
  // Shared post bubble
  sharedPost: {
    maxWidth: '75%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  sharedPostMine: {
    backgroundColor: colors.primary,
  },
  sharedPostTheirs: {
    backgroundColor: colors.backgroundSecondary,
    marginLeft: spacing.sm,
  },
  sharedPostImage: {
    width: 220,
    height: 180,
  },
  sharedPostInfo: {
    padding: spacing.sm,
  },
  sharedPostUsername: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  sharedPostCaption: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sharedPostLoading: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    padding: spacing.md,
  },
  // Typing indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    borderBottomLeftRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 4,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.textSecondary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    marginRight: spacing.sm,
  },
  loader: {
    flex: 1,
  },
  emptyChat: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyChatText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
});

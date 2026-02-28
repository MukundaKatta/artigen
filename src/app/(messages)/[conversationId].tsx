import React, { useState } from 'react';
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
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/AuthProvider';
import { useChat } from '@/hooks/useChat';
import { Avatar } from '@/components/ui/Avatar';
import { colors, spacing, fontSize, borderRadius, typography, shadows } from '@/lib/theme';
import type { MessageWithSender } from '@/types';

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
  } = useChat(conversationId, user?.id);
  const [text, setText] = useState('');

  function handleSend() {
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  }

  function renderMessage({ item }: { item: MessageWithSender }) {
    const isMine = item.sender_id === user?.id;

    return (
      <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
        {!isMine && <Avatar uri={item.sender?.avatar_url} size="sm" />}
        <View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleTheirs,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMine && styles.messageTextMine,
            ]}
          >
            {item.content}
          </Text>
        </View>
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
          onChangeText={setText}
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
  messageText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 20,
  },
  messageTextMine: {
    color: colors.textLight,
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

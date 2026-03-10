import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/providers/AuthProvider';
import { chatMessage, TEXT_AI_PROVIDERS } from '@/services/text-ai.service';
import type { TextAIProvider, ChatMessage } from '@/services/text-ai.service';
import { TEXT_AI_CREDITS } from '@/services/credits.service';
import { colors, spacing, fontSize, typography, borderRadius, shadows } from '@/lib/theme';

const SUGGESTIONS = [
  'Help me write a cinematic prompt for a space scene',
  'What are the best styles for portrait photography prompts?',
  'How can I make my AI art look more professional?',
  'Suggest 5 creative art concepts I can generate',
];

export default function AIAssistantScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [provider, setProvider] = useState<TextAIProvider>('claude');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || sending) return;

    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setSending(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const { result, error } = await chatMessage(newMessages, provider);
    setSending(false);

    if (error) {
      if (error === 'insufficient_credits') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '⚠️ You need more credits. Tap "Buy Credits" to top up.',
          },
        ]);
        return;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${error}` }]);
      return;
    }

    setMessages((prev) => [...prev, { role: 'assistant', content: result || '' }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, provider, sending]);

  return (
    <>
      <Stack.Screen options={{ title: 'AI Assistant' }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        {/* Provider Selector */}
        <View style={styles.providerBar}>
          {TEXT_AI_PROVIDERS.map((p) => (
            <Pressable
              key={p.value}
              style={[styles.providerChip, provider === p.value && styles.providerChipActive]}
              onPress={() => setProvider(p.value)}
            >
              <Text style={[styles.providerChipText, provider === p.value && styles.providerChipTextActive]}>
                {p.label}
              </Text>
            </Pressable>
          ))}
          <View style={styles.creditHint}>
            <Ionicons name="sparkles" size={12} color={colors.textSecondary} />
            <Text style={styles.creditHintText}>{TEXT_AI_CREDITS}/msg</Text>
          </View>
          <Pressable onPress={() => router.push('/(screens)/buy-credits')}>
            <Text style={styles.buyLink}>Buy Credits</Text>
          </Pressable>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={['#833AB4', '#E1306C', '#F77737']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.emptyIcon}
              >
                <Ionicons name="chatbubble-ellipses" size={32} color="#fff" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>AI Art Assistant</Text>
              <Text style={styles.emptySubtitle}>
                Ask Claude, GPT-4o, or Gemini to help you create, refine prompts, or explore art ideas.
              </Text>
              <Text style={styles.suggestionsLabel}>Try asking:</Text>
              {SUGGESTIONS.map((s) => (
                <Pressable key={s} style={styles.suggestion} onPress={() => send(s)}>
                  <Text style={styles.suggestionText}>{s}</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                </Pressable>
              ))}
            </View>
          )}

          {messages.map((msg, i) => (
            <View
              key={i}
              style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}
            >
              {msg.role === 'assistant' && (
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={14} color={colors.primary} />
                </View>
              )}
              <View style={[styles.bubbleContent, msg.role === 'user' ? styles.userBubbleContent : styles.aiBubbleContent]}>
                <Text style={[styles.bubbleText, msg.role === 'user' && styles.userBubbleText]}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {sending && (
            <View style={[styles.bubble, styles.aiBubble]}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={14} color={colors.primary} />
              </View>
              <View style={styles.aiBubbleContent}>
                <LoadingSpinner size="small" color={colors.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything about AI art..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={1000}
            onSubmitEditing={() => send(input)}
          />
          <Pressable
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim() || sending}
          >
            <Ionicons name="send" size={20} color={!input.trim() || sending ? colors.textSecondary : '#fff'} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  providerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  providerChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  providerChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  providerChipText: { fontSize: fontSize.sm, fontFamily: typography.medium, color: colors.textSecondary },
  providerChipTextActive: { color: '#fff' },
  creditHint: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 'auto' as any },
  creditHintText: { fontSize: fontSize.xs, color: colors.textSecondary, fontFamily: typography.regular },
  buyLink: { fontSize: fontSize.xs, color: colors.primary, fontFamily: typography.semiBold },
  messageList: { flex: 1 },
  messageListContent: { padding: spacing.lg, paddingBottom: spacing.xl },
  emptyState: { alignItems: 'center', paddingTop: spacing.xxxl },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  emptyTitle: { fontSize: fontSize.xl, fontFamily: typography.bold, color: colors.text, marginBottom: spacing.sm },
  emptySubtitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  suggestionsLabel: { fontSize: fontSize.sm, fontFamily: typography.semiBold, color: colors.textSecondary, alignSelf: 'flex-start', marginBottom: spacing.sm },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: { flex: 1, fontSize: fontSize.sm, fontFamily: typography.regular, color: colors.text, lineHeight: 18 },
  bubble: { flexDirection: 'row', marginBottom: spacing.md, alignItems: 'flex-end', gap: spacing.sm },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleContent: {
    maxWidth: '80%',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
  },
  userBubbleContent: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  aiBubbleContent: {
    backgroundColor: colors.backgroundSecondary,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  bubbleText: { fontSize: fontSize.md, fontFamily: typography.regular, color: colors.text, lineHeight: 22 },
  userBubbleText: { color: '#fff' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.backgroundSecondary },
});

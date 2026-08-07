import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius, withOpacity } from '@/lib/theme';
import type { StorySticker } from '@/types';

type Props = {
  sticker: StorySticker;
  userId: string;
  onRespond: (response: Record<string, unknown>) => void;
};

export function QuestionSticker({ sticker, onRespond }: Props) {
  const config = sticker.config as { question: string };
  const [answer, setAnswer] = useState('');
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!answer.trim()) return;
    onRespond({ text: answer.trim() });
    setSent(true);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{config.question || 'Ask me anything'}</Text>
      {sent ? (
        <View style={styles.sentRow}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.sentText}>Sent!</Text>
        </View>
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type your answer..."
            placeholderTextColor={withOpacity(colors.backgroundDark, 0.4)}
            value={answer}
            onChangeText={setAnswer}
            accessibilityLabel="Your answer"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!answer.trim()}
            accessibilityRole="button"
            accessibilityLabel="Send answer"
            accessibilityState={{ disabled: !answer.trim() }}
          >
            <Ionicons
              name="send"
              size={18}
              color={answer.trim() ? colors.primary : colors.border}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: withOpacity(colors.textLight, 0.95),
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: 220,
  },
  question: {
    fontSize: fontSize.md,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.backgroundDark,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.backgroundDark,
    paddingVertical: spacing.xs,
  },
  sentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  sentText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.success,
  },
});

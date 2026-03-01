import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
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
          <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
          <Text style={styles.sentText}>Sent!</Text>
        </View>
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type your answer..."
            placeholderTextColor="rgba(0,0,0,0.4)"
            value={answer}
            onChangeText={setAnswer}
          />
          <TouchableOpacity onPress={handleSend} disabled={!answer.trim()}>
            <Ionicons name="send" size={18} color={answer.trim() ? colors.primary : '#ccc'} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: 220,
  },
  question: {
    fontSize: fontSize.md,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: '#000',
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
    color: '#22C55E',
  },
});

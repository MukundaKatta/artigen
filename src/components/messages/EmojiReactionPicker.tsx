import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/lib/theme';

const QUICK_EMOJIS = ['❤️', '😂', '👍', '😮', '😢', '🔥'];

type Props = {
  onSelect: (emoji: string) => void;
  visible: boolean;
};

export function EmojiReactionPicker({ onSelect, visible }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      {QUICK_EMOJIS.map((emoji) => (
        <TouchableOpacity
          key={emoji}
          onPress={() => onSelect(emoji)}
          style={styles.emojiButton}
          activeOpacity={0.7}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emojiButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  emoji: {
    fontSize: 24,
  },
});

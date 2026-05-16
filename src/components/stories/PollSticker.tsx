import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, typography, borderRadius, withOpacity } from '@/lib/theme';
import type { StorySticker } from '@/types';

type Props = {
  sticker: StorySticker;
  userId: string;
  onRespond: (response: Record<string, unknown>) => void;
};

export function PollSticker({ sticker, onRespond }: Props) {
  const config = sticker.config as { question: string; options: string[] };
  const [voted, setVoted] = useState<number | null>(null);

  function handleVote(index: number) {
    if (voted !== null) return;
    setVoted(index);
    onRespond({ option: index });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{config.question || 'Poll'}</Text>
      {(config.options || ['Yes', 'No']).map((option: string, i: number) => (
        <TouchableOpacity
          key={i}
          style={[styles.option, voted === i && styles.optionSelected]}
          onPress={() => handleVote(i)}
          disabled={voted !== null}
        >
          <Text style={[styles.optionText, voted === i && styles.optionTextSelected]}>
            {option}
          </Text>
          {voted !== null && (
            <View style={[styles.resultBar, { width: voted === i ? '70%' : '30%' }]} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: withOpacity(colors.textLight, 0.95),
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: 200,
  },
  question: {
    fontSize: fontSize.md,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.backgroundDark,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: withOpacity(colors.primary, 0.06),
  },
  optionText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.backgroundDark,
    textAlign: 'center',
    zIndex: 1,
  },
  optionTextSelected: {
    color: colors.primary,
    fontFamily: typography.bold,
    fontWeight: '700',
  },
  resultBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: withOpacity(colors.primary, 0.12),
    borderRadius: borderRadius.md,
  },
});

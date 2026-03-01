import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { StorySticker } from '@/types';

type Props = {
  sticker: StorySticker;
  userId: string;
  onRespond: (response: Record<string, unknown>) => void;
};

export function QuizSticker({ sticker, onRespond }: Props) {
  const config = sticker.config as { question: string; options: string[]; correct: number };
  const [answered, setAnswered] = useState<number | null>(null);

  function handleAnswer(index: number) {
    if (answered !== null) return;
    setAnswered(index);
    onRespond({ answer: index, correct: index === config.correct });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>QUIZ</Text>
      <Text style={styles.question}>{config.question || 'Quiz'}</Text>
      {(config.options || []).map((option: string, i: number) => {
        const isCorrect = i === config.correct;
        const isSelected = answered === i;
        const showResult = answered !== null;

        let bgColor = 'transparent';
        if (showResult && isCorrect) bgColor = '#22C55E';
        else if (showResult && isSelected && !isCorrect) bgColor = '#EF4444';

        return (
          <TouchableOpacity
            key={i}
            style={[styles.option, showResult && { backgroundColor: bgColor }]}
            onPress={() => handleAnswer(i)}
            disabled={answered !== null}
          >
            <Text style={[styles.optionText, showResult && (isCorrect || isSelected) && { color: '#fff' }]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#8B5CF6',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: 200,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  question: {
    fontSize: fontSize.md,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: spacing.xs,
  },
  optionText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: '#fff',
    textAlign: 'center',
  },
});

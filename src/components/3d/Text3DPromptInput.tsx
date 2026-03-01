import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input } from '@/components/ui/Input';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  prompt: string;
  onChangePrompt: (text: string) => void;
  negativePrompt?: string;
  onChangeNegativePrompt?: (text: string) => void;
};

const TIPS = [
  'Be specific about the shape and materials',
  'Mention lighting and surface finish',
  'Describe the viewing angle if relevant',
];

export function Text3DPromptInput({ prompt, onChangePrompt, negativePrompt, onChangeNegativePrompt }: Props) {
  return (
    <View style={styles.container}>
      <Input
        label="Describe your 3D model"
        placeholder="e.g., A cute low-poly fox with orange fur..."
        value={prompt}
        onChangeText={onChangePrompt}
        multiline
        numberOfLines={3}
        style={styles.textArea}
      />

      {onChangeNegativePrompt !== undefined && (
        <Input
          label="Negative prompt (optional)"
          placeholder="Things to avoid..."
          value={negativePrompt}
          onChangeText={onChangeNegativePrompt}
        />
      )}

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Tips for better results:</Text>
        {TIPS.map((tip, index) => (
          <Text key={index} style={styles.tip}>
            {'\u2022'} {tip}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tipsContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  tipsTitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tip: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginBottom: 2,
  },
});

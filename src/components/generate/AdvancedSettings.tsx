import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  negativePrompt: string;
  onNegativePromptChange: (text: string) => void;
  steps: number;
  onStepsChange: (value: number) => void;
  maxSteps: number;
  cfgScale: number;
  onCfgScaleChange: (value: number) => void;
  seed: string;
  onSeedChange: (text: string) => void;
};

export function AdvancedSettings({
  negativePrompt,
  onNegativePromptChange,
  steps,
  onStepsChange,
  maxSteps,
  cfgScale,
  onCfgScaleChange,
  seed,
  onSeedChange,
}: Props) {
  return (
    <View style={styles.advancedContainer}>
      {/* Negative Prompt */}
      <Text style={styles.label}>Negative Prompt</Text>
      <TextInput
        style={[styles.promptInput, { height: 60 }]}
        placeholder="What to avoid..."
        placeholderTextColor={colors.textSecondary}
        value={negativePrompt}
        onChangeText={onNegativePromptChange}
        multiline
        textAlignVertical="top"
      />

      {/* Steps */}
      <View style={styles.sliderRow}>
        <Text style={styles.label}>Steps: {steps}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={maxSteps}
          step={1}
          value={steps}
          onValueChange={onStepsChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
          accessibilityLabel={`Inference steps: ${steps}`}
          accessibilityRole="adjustable"
        />
      </View>

      {/* CFG Scale */}
      <View style={styles.sliderRow}>
        <Text style={styles.label}>CFG Scale: {cfgScale.toFixed(1)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={20}
          step={0.5}
          value={cfgScale}
          onValueChange={onCfgScaleChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
          accessibilityLabel={`CFG Scale: ${cfgScale.toFixed(1)}`}
          accessibilityRole="adjustable"
        />
      </View>

      {/* Seed */}
      <Text style={styles.label}>Seed (optional)</Text>
      <TextInput
        style={styles.seedInput}
        placeholder="Random"
        placeholderTextColor={colors.textSecondary}
        value={seed}
        onChangeText={onSeedChange}
        keyboardType="number-pad"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  advancedContainer: {
    paddingBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  promptInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    backgroundColor: colors.backgroundSecondary,
  },
  sliderRow: {
    marginBottom: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  seedInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    backgroundColor: colors.backgroundSecondary,
  },
});

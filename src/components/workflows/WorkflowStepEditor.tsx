import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius, accentColors } from '@/lib/theme';
import type { WorkflowStep, WorkflowStepType } from '@/services/workflow.service';

type Props = {
  step?: WorkflowStep;
  onSave: (step: WorkflowStep) => void;
  onCancel: () => void;
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const STEP_TYPES: { type: WorkflowStepType; icon: IoniconName; label: string; color: string }[] = [
  { type: 'generate', icon: 'sparkles', label: 'Generate', color: colors.accent },
  { type: 'restyle', icon: 'color-palette', label: 'Restyle', color: accentColors.pink },
  { type: 'inpaint', icon: 'brush', label: 'Inpaint', color: accentColors.amber },
  { type: 'upscale', icon: 'resize', label: 'Upscale', color: accentColors.emerald },
];

const SCALE_OPTIONS = [2, 4];

// Cap free-text prompt fields (mirrors the generation prompt cap).
const MAX_PROMPT_LENGTH = 2000;

export function WorkflowStepEditor({ step, onSave, onCancel }: Props) {
  const [type, setType] = useState<WorkflowStepType>(step?.type || 'generate');
  const [prompt, setPrompt] = useState(step?.prompt || '');
  const [customPrompt, setCustomPrompt] = useState(step?.custom_prompt || '');
  const [maskPrompt, setMaskPrompt] = useState(step?.mask_prompt || '');
  const [scaleFactor, setScaleFactor] = useState(step?.scale_factor || 2);

  const handleSave = () => {
    const newStep: WorkflowStep = { type };

    switch (type) {
      case 'generate':
        newStep.prompt = prompt;
        break;
      case 'restyle':
        newStep.custom_prompt = customPrompt;
        break;
      case 'inpaint':
        newStep.mask_prompt = maskPrompt;
        newStep.prompt = prompt;
        break;
      case 'upscale':
        newStep.scale_factor = scaleFactor;
        break;
    }

    onSave(newStep);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{step ? 'Edit Step' : 'Add Step'}</Text>

      {/* Type picker */}
      <Text style={styles.label}>Type</Text>
      <View style={styles.typeRow}>
        {STEP_TYPES.map((t) => (
          <TouchableOpacity
            key={t.type}
            style={[styles.typeChip, type === t.type && { backgroundColor: t.color + '20', borderColor: t.color }]}
            onPress={() => setType(t.type)}
            activeOpacity={0.7}
          >
            <Ionicons name={t.icon} size={16} color={type === t.type ? t.color : colors.textSecondary} />
            <Text style={[styles.typeChipText, type === t.type && { color: t.color }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Type-specific fields */}
      {type === 'generate' && (
        <View style={styles.field}>
          <Text style={styles.label}>Prompt</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe what to generate..."
            placeholderTextColor={colors.textSecondary}
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={3}
            maxLength={MAX_PROMPT_LENGTH}
          />
        </View>
      )}

      {type === 'restyle' && (
        <View style={styles.field}>
          <Text style={styles.label}>Style Prompt</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the style to apply..."
            placeholderTextColor={colors.textSecondary}
            value={customPrompt}
            onChangeText={setCustomPrompt}
            multiline
            numberOfLines={3}
            maxLength={MAX_PROMPT_LENGTH}
          />
        </View>
      )}

      {type === 'inpaint' && (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>Mask Prompt</Text>
            <TextInput
              style={styles.input}
              placeholder="What area to modify (e.g. 'the sky')"
              placeholderTextColor={colors.textSecondary}
              value={maskPrompt}
              onChangeText={setMaskPrompt}
              maxLength={MAX_PROMPT_LENGTH}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Replacement Prompt</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What to paint in that area..."
              placeholderTextColor={colors.textSecondary}
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={3}
              maxLength={MAX_PROMPT_LENGTH}
            />
          </View>
        </>
      )}

      {type === 'upscale' && (
        <View style={styles.field}>
          <Text style={styles.label}>Scale Factor</Text>
          <View style={styles.scaleRow}>
            {SCALE_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.scaleChip, scaleFactor === s && styles.scaleChipActive]}
                onPress={() => setScaleFactor(s)}
                activeOpacity={0.7}
              >
                <Text style={[styles.scaleChipText, scaleFactor === s && styles.scaleChipTextActive]}>
                  {s}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.7}>
          <Text style={styles.saveButtonText}>{step ? 'Update' : 'Add Step'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  typeChipText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  field: {
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
  },
  textArea: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  scaleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scaleChip: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  scaleChipActive: {
    backgroundColor: accentColors.emerald,
    borderColor: accentColors.emerald,
  },
  scaleChipText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  scaleChipTextActive: {
    color: colors.textLight,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textLight,
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { AI_MODELS } from '@/services/ai.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { AiModel } from '@/types';

export type PromptFormValues = {
  title: string;
  prompt: string;
  negative_prompt: string;
  model_id: string;
  style_tags: string[];
  is_public: boolean;
};

// Input bounds (also enforced server-side; these are the UX guardrails).
const MAX_TITLE_LENGTH = 100;
const MAX_PROMPT_LENGTH = 2000;
const MAX_NEGATIVE_LENGTH = 1000;
const MAX_STYLE_TAGS = 10;

type Props = {
  initial?: Partial<PromptFormValues>;
  onSubmit: (values: PromptFormValues) => Promise<void>;
  submitting?: boolean;
};

export function PromptForm({ initial = {}, onSubmit, submitting }: Props) {
  const [title, setTitle] = useState(initial.title || '');
  const [prompt, setPrompt] = useState(initial.prompt || '');
  const [negative, setNegative] = useState(initial.negative_prompt || '');
  const [modelId, setModelId] = useState(initial.model_id || AI_MODELS[0].id);
  const [styleTagsText, setStyleTagsText] = useState((initial.style_tags || []).join(', '));
  const [isPublic, setIsPublic] = useState(initial.is_public ?? true);
  const [errors, setErrors] = useState<{ title?: string; prompt?: string; styleTags?: string }>({});

  const validate = (parsedTags: string[]): boolean => {
    const newErrors: { title?: string; prompt?: string; styleTags?: string } = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!prompt.trim()) newErrors.prompt = 'Prompt is required';
    if (parsedTags.length > MAX_STYLE_TAGS) {
      newErrors.styleTags = `Up to ${MAX_STYLE_TAGS} style tags allowed`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const parsedTags = styleTagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (!validate(parsedTags)) return;
    const values: PromptFormValues = {
      title: title.trim(),
      prompt: prompt.trim(),
      negative_prompt: negative.trim(),
      model_id: modelId,
      style_tags: parsedTags,
      is_public: isPublic,
    };
    await onSubmit(values);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={[styles.input, errors.title ? styles.inputError : undefined]}
        value={title}
        onChangeText={(v) => { setTitle(v); if (errors.title) setErrors((e) => ({ ...e, title: undefined })); }}
        placeholder="Enter a title"
        placeholderTextColor={colors.textSecondary}
        maxLength={MAX_TITLE_LENGTH}
        accessibilityLabel="Prompt title"
        accessibilityHint="Enter a title for your prompt"
      />
      {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

      <Text style={styles.label}>Prompt</Text>
      <TextInput
        style={[styles.input, styles.multiLine, errors.prompt ? styles.inputError : undefined]}
        value={prompt}
        onChangeText={(v) => { setPrompt(v); if (errors.prompt) setErrors((e) => ({ ...e, prompt: undefined })); }}
        placeholder="Describe what you want to generate"
        placeholderTextColor={colors.textSecondary}
        multiline
        maxLength={MAX_PROMPT_LENGTH}
        accessibilityLabel="Generation prompt"
        accessibilityHint="Describe the image you want to create"
      />
      {errors.prompt && <Text style={styles.errorText}>{errors.prompt}</Text>}

      <Text style={styles.label}>Negative Prompt</Text>
      <TextInput
        style={[styles.input, styles.multiLine]}
        value={negative}
        onChangeText={setNegative}
        placeholder="What to avoid (optional)"
        placeholderTextColor={colors.textSecondary}
        multiline
        maxLength={MAX_NEGATIVE_LENGTH}
        accessibilityLabel="Negative prompt"
        accessibilityHint="Describe what to avoid in the generated image"
      />

      <Text style={styles.label}>Model</Text>
      <View style={styles.modelPicker} accessibilityRole="radiogroup" accessibilityLabel="Select AI model">
        {AI_MODELS.filter((m) => m.category === 'image').map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[
              styles.modelOption,
              modelId === m.id && styles.modelOptionSelected,
            ]}
            onPress={() => setModelId(m.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: modelId === m.id }}
            accessibilityLabel={m.name}
          >
            <Text
              style={[
                styles.modelOptionText,
                modelId === m.id && styles.modelOptionTextSelected,
              ]}
            >
              {m.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Style Tags (comma separated)</Text>
      <TextInput
        style={[styles.input, errors.styleTags ? styles.inputError : undefined]}
        value={styleTagsText}
        onChangeText={(v) => { setStyleTagsText(v); if (errors.styleTags) setErrors((e) => ({ ...e, styleTags: undefined })); }}
        placeholder="e.g. fantasy, dark, neon"
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel="Style tags"
        accessibilityHint={`Enter up to ${MAX_STYLE_TAGS} comma separated style tags`}
      />
      {errors.styleTags && <Text style={styles.errorText}>{errors.styleTags}</Text>}

      <View style={styles.switchRow}>
        <Text style={styles.label}>Public</Text>
        <Switch
          value={isPublic}
          onValueChange={setIsPublic}
          accessibilityLabel="Make prompt public"
        />
      </View>

      <Button
        title={submitting ? 'Saving...' : 'Save'}
        onPress={handleSubmit}
        disabled={submitting}
        loading={submitting}
        size="lg"
        style={styles.saveButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.backgroundSecondary,
    padding: spacing.sm,
    marginBottom: spacing.md,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.error,
    marginBottom: spacing.md,
  },
  multiLine: {
    height: 80,
    textAlignVertical: 'top',
  },
  modelPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  modelOption: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  modelOptionSelected: {
    backgroundColor: colors.primary,
  },
  modelOptionText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  modelOptionTextSelected: {
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});

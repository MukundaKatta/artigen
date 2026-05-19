import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { AI_MODELS } from '@/services/ai.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { AiModel } from '@/types';

const PROMPT_TITLE_MAX = 100;
const PROMPT_BODY_MAX = 2000;
const PROMPT_NEGATIVE_MAX = 1000;
const PROMPT_STYLE_TAGS_MAX = 200;

const promptSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(PROMPT_TITLE_MAX, `Title must be ${PROMPT_TITLE_MAX} characters or fewer`),
  prompt: z
    .string()
    .trim()
    .min(1, 'Prompt is required')
    .max(PROMPT_BODY_MAX, `Prompt must be ${PROMPT_BODY_MAX} characters or fewer`),
  negative_prompt: z
    .string()
    .max(PROMPT_NEGATIVE_MAX, `Negative prompt must be ${PROMPT_NEGATIVE_MAX} characters or fewer`),
  style_tags_text: z
    .string()
    .max(PROMPT_STYLE_TAGS_MAX, `Style tags must be ${PROMPT_STYLE_TAGS_MAX} characters or fewer`),
});

export type PromptFormValues = {
  title: string;
  prompt: string;
  negative_prompt: string;
  model_id: string;
  style_tags: string[];
  is_public: boolean;
};

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
  const [errors, setErrors] = useState<{
    title?: string;
    prompt?: string;
    negative_prompt?: string;
    style_tags_text?: string;
  }>({});

  const validate = (): boolean => {
    const result = promptSchema.safeParse({
      title,
      prompt,
      negative_prompt: negative,
      style_tags_text: styleTagsText,
    });
    if (result.success) {
      setErrors({});
      return true;
    }
    const newErrors: typeof errors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof typeof errors;
      if (key && !newErrors[key]) newErrors[key] = issue.message;
    }
    setErrors(newErrors);
    return false;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const values: PromptFormValues = {
      title: title.trim(),
      prompt: prompt.trim(),
      negative_prompt: negative.trim(),
      model_id: modelId,
      style_tags: styleTagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
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
        onChangeText={(v) => {
          setTitle(v);
          if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
        }}
        placeholder="Enter a title"
        placeholderTextColor={colors.textSecondary}
        maxLength={PROMPT_TITLE_MAX}
        accessibilityLabel="Prompt title"
        accessibilityHint="Enter a title for your prompt"
      />
      {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

      <Text style={styles.label}>Prompt</Text>
      <TextInput
        style={[styles.input, styles.multiLine, errors.prompt ? styles.inputError : undefined]}
        value={prompt}
        onChangeText={(v) => {
          setPrompt(v);
          if (errors.prompt) setErrors((e) => ({ ...e, prompt: undefined }));
        }}
        placeholder="Describe what you want to generate"
        placeholderTextColor={colors.textSecondary}
        multiline
        maxLength={PROMPT_BODY_MAX}
        accessibilityLabel="Generation prompt"
        accessibilityHint="Describe the image you want to create"
      />
      {errors.prompt && <Text style={styles.errorText}>{errors.prompt}</Text>}

      <Text style={styles.label}>Negative Prompt</Text>
      <TextInput
        style={[
          styles.input,
          styles.multiLine,
          errors.negative_prompt ? styles.inputError : undefined,
        ]}
        value={negative}
        onChangeText={(v) => {
          setNegative(v);
          if (errors.negative_prompt) setErrors((e) => ({ ...e, negative_prompt: undefined }));
        }}
        placeholder="What to avoid (optional)"
        placeholderTextColor={colors.textSecondary}
        multiline
        maxLength={PROMPT_NEGATIVE_MAX}
        accessibilityLabel="Negative prompt"
        accessibilityHint="Describe what to avoid in the generated image"
      />
      {errors.negative_prompt && <Text style={styles.errorText}>{errors.negative_prompt}</Text>}

      <Text style={styles.label}>Model</Text>
      <View
        style={styles.modelPicker}
        accessibilityRole="radiogroup"
        accessibilityLabel="Select AI model"
      >
        {AI_MODELS.filter((m) => m.category === 'image').map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.modelOption, modelId === m.id && styles.modelOptionSelected]}
            onPress={() => setModelId(m.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: modelId === m.id }}
            accessibilityLabel={m.name}
          >
            <Text
              style={[styles.modelOptionText, modelId === m.id && styles.modelOptionTextSelected]}
            >
              {m.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Style Tags (comma separated)</Text>
      <TextInput
        style={[styles.input, errors.style_tags_text ? styles.inputError : undefined]}
        value={styleTagsText}
        onChangeText={(v) => {
          setStyleTagsText(v);
          if (errors.style_tags_text) setErrors((e) => ({ ...e, style_tags_text: undefined }));
        }}
        placeholder="e.g. fantasy, dark, neon"
        placeholderTextColor={colors.textSecondary}
        maxLength={PROMPT_STYLE_TAGS_MAX}
        accessibilityLabel="Style tags"
        accessibilityHint="Enter comma separated style tags"
      />
      {errors.style_tags_text && <Text style={styles.errorText}>{errors.style_tags_text}</Text>}

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

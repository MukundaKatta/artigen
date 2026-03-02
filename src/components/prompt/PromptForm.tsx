import React, { useState, useEffect } from 'react';
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

  const handleSubmit = async () => {
    if (!title.trim() || !prompt.trim()) {
      return; // maybe show error earlier
    }
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
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter a title"
      />

      <Text style={styles.label}>Prompt</Text>
      <TextInput
        style={[styles.input, styles.multiLine]}
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Describe what you want to generate"
        multiline
      />

      <Text style={styles.label}>Negative Prompt</Text>
      <TextInput
        style={[styles.input, styles.multiLine]}
        value={negative}
        onChangeText={setNegative}
        placeholder="What to avoid (optional)"
        multiline
      />

      <Text style={styles.label}>Model</Text>
      <View style={styles.modelPicker}>        
        {AI_MODELS.filter((m) => m.category === 'image').map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[
              styles.modelOption,
              modelId === m.id && styles.modelOptionSelected,
            ]}
            onPress={() => setModelId(m.id)}
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
        style={styles.input}
        value={styleTagsText}
        onChangeText={setStyleTagsText}
        placeholder="e.g. fantasy, dark, neon"
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Public</Text>
        <Switch value={isPublic} onValueChange={setIsPublic} />
      </View>

      <Button
        title={submitting ? 'Saving...' : 'Save'}
        onPress={handleSubmit}
        disabled={submitting}
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
    padding: spacing.sm,
    marginBottom: spacing.md,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
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

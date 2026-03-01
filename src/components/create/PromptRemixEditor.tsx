import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = {
  originalPrompt: string;
  modifiedPrompt: string;
  onChangeModified: (text: string) => void;
};

export function PromptRemixEditor({ originalPrompt, modifiedPrompt, onChangeModified }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Original Prompt</Text>
        <Text style={styles.originalText}>{originalPrompt}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Your Remix</Text>
        <TextInput
          style={styles.input}
          value={modifiedPrompt}
          onChangeText={onChangeModified}
          multiline
          placeholder="Modify the prompt..."
          placeholderTextColor={colors.textSecondary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  section: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontFamily: typography.bold, color: colors.text, marginBottom: spacing.xs },
  originalText: { fontSize: fontSize.sm, color: colors.textSecondary, backgroundColor: colors.surface, padding: spacing.sm, borderRadius: 8 },
  input: { fontSize: fontSize.sm, color: colors.text, backgroundColor: colors.surface, padding: spacing.sm, borderRadius: 8, minHeight: 100, textAlignVertical: 'top' },
});

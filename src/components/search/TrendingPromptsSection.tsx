import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TrendingPromptCard } from './TrendingPromptCard';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = { prompts: any[]; onGenerate: (prompt: string) => void };

export function TrendingPromptsSection({ prompts, onGenerate }: Props) {
  if (prompts.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trending Prompts</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {prompts.map((p, i) => (
          <TrendingPromptCard key={i} prompt={p} onGenerate={() => onGenerate(p.prompt)} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: spacing.sm },
  title: { fontSize: fontSize.md, fontFamily: typography.bold, color: colors.text, paddingHorizontal: spacing.md, marginBottom: spacing.xs },
  scroll: { paddingHorizontal: spacing.md, gap: spacing.sm },
});

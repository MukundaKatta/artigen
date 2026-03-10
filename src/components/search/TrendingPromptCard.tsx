import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = { prompt: any; onGenerate: () => void };

export const TrendingPromptCard = React.memo(function TrendingPromptCard({ prompt, onGenerate }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.prompt} numberOfLines={3}>{prompt.prompt}</Text>
      <View style={styles.meta}>
        <Text style={styles.count}>{prompt.use_count} uses</Text>
        <Text style={styles.model}>{prompt.model_name}</Text>
      </View>
      <TouchableOpacity style={styles.btn} onPress={onGenerate}>
        <Ionicons name="sparkles" size={14} color="#fff" />
        <Text style={styles.btnText}>Generate</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { width: 200, backgroundColor: colors.surface, borderRadius: 12, padding: spacing.sm },
  prompt: { fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  meta: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  count: { fontSize: fontSize.xs, color: colors.textSecondary },
  model: { fontSize: fontSize.xs, color: colors.primary },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.primary, borderRadius: 6, padding: spacing.xs },
  btnText: { color: '#fff', fontSize: fontSize.xs, fontFamily: typography.bold },
});

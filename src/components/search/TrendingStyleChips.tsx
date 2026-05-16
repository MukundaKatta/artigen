import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export type TrendingStyleEntry = { style: string; post_count: number };

type Props = { styles_data: TrendingStyleEntry[]; onSelect: (style: string) => void };

export function TrendingStyleChips({ styles_data, onSelect }: Props) {
  if (styles_data.length === 0) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {styles_data.map((s, i) => (
        <TouchableOpacity key={i} style={styles.chip} onPress={() => onSelect(s.style)}>
          <Text style={styles.text}>{s.style}</Text>
          <Text style={styles.count}>{s.post_count}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.md, gap: spacing.xs, paddingVertical: spacing.xs },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 20 },
  text: { fontSize: fontSize.sm, color: colors.text, fontFamily: typography.medium },
  count: { fontSize: fontSize.xs, color: colors.textSecondary },
});

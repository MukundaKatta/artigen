import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

const TYPES = [
  { key: 'motion', label: 'Motion', icon: 'play-circle-outline' as const },
  { key: 'camera_pan', label: 'Camera Pan', icon: 'videocam-outline' as const },
  { key: 'parallax', label: 'Parallax', icon: 'layers-outline' as const },
  { key: 'zoom', label: 'Zoom', icon: 'search-outline' as const },
  { key: 'morph', label: 'Morph', icon: 'git-merge-outline' as const },
];

type Props = { selected: string; onSelect: (type: string) => void };

export function AnimationTypePicker({ selected, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {TYPES.map(t => (
        <TouchableOpacity
          key={t.key}
          style={[styles.chip, selected === t.key && styles.chipActive]}
          onPress={() => onSelect(t.key)}
        >
          <Ionicons name={t.icon} size={20} color={selected === t.key ? '#fff' : colors.text} />
          <Text style={[styles.text, selected === t.key && styles.textActive]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingVertical: spacing.sm },
  chip: { alignItems: 'center', padding: spacing.sm, borderRadius: 12, backgroundColor: colors.surface, minWidth: 80 },
  chipActive: { backgroundColor: colors.primary },
  text: { fontSize: fontSize.xs, color: colors.text, fontFamily: typography.medium, marginTop: 4 },
  textActive: { color: '#fff' },
});

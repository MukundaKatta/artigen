import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import { STYLE_OPTIONS, THEME_OPTIONS, PALETTE_OPTIONS } from '@/lib/constants';

type Props = {
  selectedStyles: string[];
  selectedThemes: string[];
  selectedPalettes: string[];
  onToggleStyle: (style: string) => void;
  onToggleTheme: (theme: string) => void;
  onTogglePalette: (palette: string) => void;
};

function ChipGroup({ title, options, selected, onToggle }: { title: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  // Defensive: only forward values that belong to this group's allowed set,
  // so a stray value can never be persisted to the taste profile.
  const handleToggle = (value: string) => {
    if (options.includes(value)) onToggle(value);
  };
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chips}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, selected.includes(opt) && styles.chipActive]}
            onPress={() => handleToggle(opt)}
            accessibilityRole="button"
            accessibilityState={{ selected: selected.includes(opt) }}
            accessibilityLabel={`${opt}${selected.includes(opt) ? ', selected' : ''}`}
          >
            <Text style={[styles.chipText, selected.includes(opt) && styles.chipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function TasteProfileEditor(props: Props) {
  return (
    <ScrollView style={styles.container}>
      <ChipGroup title="Art Styles" options={STYLE_OPTIONS} selected={props.selectedStyles} onToggle={props.onToggleStyle} />
      <ChipGroup title="Themes" options={THEME_OPTIONS} selected={props.selectedThemes} onToggle={props.onToggleTheme} />
      <ChipGroup title="Color Palettes" options={PALETTE_OPTIONS} selected={props.selectedPalettes} onToggle={props.onTogglePalette} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { padding: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontFamily: typography.bold, color: colors.text, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: '#fff', fontFamily: typography.bold },
});

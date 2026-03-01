import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = { presets: any[]; selected?: string; onSelect: (preset: any) => void };

export function ControlNetPresetGrid({ presets, selected, onSelect }: Props) {
  return (
    <FlatList
      data={presets}
      numColumns={3}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.grid}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.card, selected === item.id && styles.cardActive]}
          onPress={() => onSelect(item)}
        >
          {item.preview_url ? (
            <Image source={{ uri: item.preview_url }} style={styles.preview} />
          ) : (
            <View style={[styles.preview, styles.placeholder]} />
          )}
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  grid: { padding: spacing.sm },
  card: { flex: 1, margin: 4, borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  cardActive: { borderColor: colors.primary },
  preview: { aspectRatio: 1, width: '100%' },
  placeholder: { backgroundColor: colors.surface },
  name: { fontSize: fontSize.xs, color: colors.text, textAlign: 'center', padding: 4, fontFamily: typography.medium },
});

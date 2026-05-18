import React from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { Image } from 'expo-image';
import { selectionAsync } from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import type { StylePreset } from '@/types/database';

type Props = {
  presets: StylePreset[];
  selectedId?: string;
  onSelect: (preset: StylePreset) => void;
};

export function StylePresetGrid({ presets, selectedId, onSelect }: Props) {
  return (
    <FlatList
      data={presets}
      numColumns={3}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.grid}
      renderItem={({ item }) => {
        const selected = selectedId === item.id;
        return (
          <AnimatedPressable
            style={[styles.card, selected ? styles.cardActive : undefined]}
            onPress={() => {
              if (Platform.OS !== 'web') selectionAsync();
              onSelect(item);
            }}
            scaleValue={0.95}
            accessibilityRole="button"
            accessibilityLabel={`${item.name} style${item.category ? `, ${item.category} category` : ''}`}
            accessibilityState={{ selected }}
          >
            {item.preview_url ? (
              <Image source={{ uri: item.preview_url }} style={styles.preview} contentFit="cover" transition={200} />
            ) : (
              <View style={[styles.preview, styles.placeholder]} />
            )}
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          </AnimatedPressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  grid: { padding: spacing.sm },
  card: { flex: 1, margin: 4, borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  cardActive: { borderColor: colors.primary },
  preview: { aspectRatio: 1, width: '100%', backgroundColor: colors.backgroundSecondary },
  placeholder: { backgroundColor: colors.surface },
  name: { fontSize: fontSize.xs, color: colors.text, textAlign: 'center', padding: 4, fontFamily: typography.medium },
});

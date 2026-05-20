import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { AvatarStyle } from '@/services/avatar.service';

type Props = {
  selectedStyle: AvatarStyle;
  onSelect: (style: AvatarStyle) => void;
};

const STYLES: { key: AvatarStyle; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: 'anime', label: 'Anime', icon: 'flash-outline', color: '#EC4899' },
  { key: 'cartoon', label: 'Cartoon', icon: 'happy-outline', color: '#F97316' },
  { key: '3d', label: '3D', icon: 'cube-outline', color: colors.accent },
  { key: 'pixel', label: 'Pixel', icon: 'grid-outline', color: '#10B981' },
  { key: 'watercolor', label: 'Watercolor', icon: 'water-outline', color: '#3B82F6' },
  { key: 'oil_painting', label: 'Oil Paint', icon: 'brush-outline', color: '#B45309' },
  { key: 'cyberpunk', label: 'Cyberpunk', icon: 'hardware-chip-outline', color: '#06B6D4' },
  { key: 'fantasy', label: 'Fantasy', icon: 'planet-outline', color: '#A855F7' },
  { key: 'minimalist', label: 'Minimal', icon: 'remove-outline', color: '#6B7280' },
  { key: 'pop_art', label: 'Pop Art', icon: 'color-palette-outline', color: '#EF4444' },
];

export function AvatarStylePicker({ selectedStyle, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">Choose Style</Text>
      <View
        style={styles.grid}
        accessibilityRole="radiogroup"
        accessibilityLabel="Avatar style"
      >
        {STYLES.map((style) => {
          const isSelected = style.key === selectedStyle;
          return (
            <TouchableOpacity
              key={style.key}
              style={[
                styles.styleItem,
                isSelected && styles.styleItemSelected,
                isSelected && { borderColor: style.color },
              ]}
              onPress={() => onSelect(style.key)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityLabel={`${style.label} style`}
              accessibilityState={{ selected: isSelected }}
            >
              <View style={[styles.iconCircle, { backgroundColor: `${style.color}15` }]}>
                <Ionicons name={style.icon} size={24} color={style.color} />
              </View>
              <Text style={[styles.styleLabel, isSelected && { color: style.color }]}>
                {style.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  styleItem: {
    width: '18%',
    minWidth: 64,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.backgroundSecondary,
  },
  styleItemSelected: {
    backgroundColor: colors.background,
    borderWidth: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  styleLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

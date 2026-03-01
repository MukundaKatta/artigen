import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

const MOODS = [
  { key: 'calm', label: 'Calm', icon: '🌊' },
  { key: 'energetic', label: 'Energetic', icon: '⚡' },
  { key: 'dramatic', label: 'Dramatic', icon: '🎭' },
  { key: 'mysterious', label: 'Mysterious', icon: '🔮' },
  { key: 'happy', label: 'Happy', icon: '☀️' },
  { key: 'sad', label: 'Sad', icon: '🌧️' },
  { key: 'epic', label: 'Epic', icon: '🏔️' },
  { key: 'ambient', label: 'Ambient', icon: '🌌' },
  { key: 'playful', label: 'Playful', icon: '🎈' },
  { key: 'dark', label: 'Dark', icon: '🌑' },
] as const;

type Props = {
  selected: string | null;
  onSelect: (mood: string) => void;
};

export function MoodPicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {MOODS.map((mood) => (
        <TouchableOpacity
          key={mood.key}
          style={[styles.moodItem, selected === mood.key && styles.moodItemSelected]}
          onPress={() => onSelect(mood.key)}
          activeOpacity={0.7}
        >
          <Text style={styles.moodIcon}>{mood.icon}</Text>
          <Text style={[styles.moodLabel, selected === mood.key && styles.moodLabelSelected]}>
            {mood.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  moodItem: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    flexGrow: 1,
  },
  moodItemSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 149, 246, 0.08)',
  },
  moodIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  moodLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: colors.primary,
    fontFamily: typography.semiBold,
  },
});

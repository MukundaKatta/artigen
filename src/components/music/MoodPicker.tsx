import React, { useCallback } from 'react';
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

type MoodKey = (typeof MOODS)[number]['key'];

type Props = {
  selected: string | null;
  onSelect: (mood: string) => void;
};

const MoodItem = React.memo(function MoodItem({
  moodKey,
  label,
  icon,
  isSelected,
  onSelect,
}: {
  moodKey: string;
  label: string;
  icon: string;
  isSelected: boolean;
  onSelect: (mood: string) => void;
}) {
  const handlePress = useCallback(() => onSelect(moodKey), [moodKey, onSelect]);
  return (
    <TouchableOpacity
      style={[styles.moodItem, isSelected && styles.moodItemSelected]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${label} mood`}
      accessibilityState={{ selected: isSelected }}
    >
      <Text style={styles.moodIcon}>{icon}</Text>
      <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

export const MoodPicker = React.memo(function MoodPicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {MOODS.map((mood) => (
        <MoodItem
          key={mood.key}
          moodKey={mood.key}
          label={mood.label}
          icon={mood.icon}
          isSelected={selected === mood.key}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
});

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

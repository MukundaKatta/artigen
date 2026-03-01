import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type ControlType = 'canny' | 'depth' | 'pose' | 'scribble' | 'normal' | 'mlsd' | 'seg';

type Props = {
  selected: ControlType;
  onSelect: (type: ControlType) => void;
};

const CONTROL_TYPES: { key: ControlType; label: string; icon: string }[] = [
  { key: 'canny', label: 'Canny', icon: '\u2312' },
  { key: 'depth', label: 'Depth', icon: '\u2261' },
  { key: 'pose', label: 'Pose', icon: '\u26B9' },
  { key: 'scribble', label: 'Scribble', icon: '\u270E' },
  { key: 'normal', label: 'Normal', icon: '\u29BF' },
  { key: 'mlsd', label: 'MLSD', icon: '\u2571' },
  { key: 'seg', label: 'Segment', icon: '\u2B22' },
];

export function ControlNetTypePicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {CONTROL_TYPES.map(({ key, label, icon }) => (
        <TouchableOpacity
          key={key}
          style={[styles.card, selected === key && styles.cardActive]}
          onPress={() => onSelect(key)}
        >
          <Text style={[styles.icon, selected === key && styles.textActive]}>{icon}</Text>
          <Text style={[styles.label, selected === key && styles.textActive]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  card: {
    width: '22%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    margin: 4,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 149, 246, 0.1)',
  },
  icon: {
    fontSize: fontSize.xxl,
    color: colors.text,
    marginBottom: 4,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.medium,
  },
  textActive: {
    color: colors.primary,
  },
});

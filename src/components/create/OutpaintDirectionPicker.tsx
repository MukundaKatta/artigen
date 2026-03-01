import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Direction = 'left' | 'right' | 'up' | 'down' | 'all';

type Props = {
  selected: Direction;
  onSelect: (direction: Direction) => void;
};

const DIRECTIONS: { key: Direction; label: string; icon: string }[] = [
  { key: 'left', label: 'Left', icon: '\u2190' },
  { key: 'right', label: 'Right', icon: '\u2192' },
  { key: 'up', label: 'Up', icon: '\u2191' },
  { key: 'down', label: 'Down', icon: '\u2193' },
  { key: 'all', label: 'All', icon: '\u2922' },
];

export function OutpaintDirectionPicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {DIRECTIONS.map(({ key, label, icon }) => (
        <TouchableOpacity
          key={key}
          style={[styles.button, selected === key && styles.buttonActive]}
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
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 60,
  },
  buttonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 149, 246, 0.1)',
  },
  icon: {
    fontSize: fontSize.xl,
    color: colors.text,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.medium,
    marginTop: 2,
  },
  textActive: {
    color: colors.primary,
  },
});

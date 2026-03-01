import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = { currentStreak: number; longestStreak?: number };

export function StreakCounter({ currentStreak, longestStreak }: Props) {
  if (currentStreak === 0) return null;
  return (
    <View style={styles.row}>
      <Ionicons name="flame" size={16} color="#FF6B00" />
      <Text style={styles.count}>{currentStreak}</Text>
      {longestStreak && longestStreak > currentStreak && (
        <Text style={styles.best}>best: {longestStreak}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  count: { fontSize: fontSize.sm, fontFamily: typography.bold, color: '#FF6B00' },
  best: { fontSize: fontSize.xs, color: colors.textSecondary },
});

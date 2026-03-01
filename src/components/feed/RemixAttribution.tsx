import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = { originalAuthor: { username: string }; onPress: () => void };

export function RemixAttribution({ originalAuthor, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Ionicons name="git-compare-outline" size={14} color={colors.textSecondary} />
      <Text style={styles.text}>Remixed from <Text style={styles.username}>@{originalAuthor.username}</Text></Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, paddingVertical: 2 },
  text: { fontSize: fontSize.xs, color: colors.textSecondary },
  username: { fontFamily: typography.bold, color: colors.primary },
});

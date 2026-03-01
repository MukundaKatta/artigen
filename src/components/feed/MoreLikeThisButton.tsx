import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = { onPress: () => void };

export function MoreLikeThisButton({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
      <Text style={styles.text}>More like this</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: spacing.xs },
  text: { fontSize: fontSize.sm, color: colors.primary, fontFamily: typography.medium },
});

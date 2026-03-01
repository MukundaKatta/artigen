import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = { onPress: () => void; active?: boolean };

export function BlendFeedButton({ onPress, active }: Props) {
  return (
    <TouchableOpacity style={[styles.btn, active && styles.btnActive]} onPress={onPress}>
      <Ionicons name="infinite-outline" size={18} color={active ? colors.primary : colors.text} />
      <Text style={[styles.text, active && styles.textActive]}>Blend</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  btnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  text: { fontSize: fontSize.sm, fontFamily: typography.medium, color: colors.text },
  textActive: { color: colors.primary },
});

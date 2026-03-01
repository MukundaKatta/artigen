import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/lib/theme';

type Props = { onPress: () => void };

export function RestyleButton({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Ionicons name="color-palette-outline" size={22} color={colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({ btn: { padding: spacing.xs } });

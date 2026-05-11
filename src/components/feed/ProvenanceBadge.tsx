import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/lib/theme';

type Props = { onPress: () => void; verified?: boolean };

export function ProvenanceBadge({ onPress, verified = true }: Props) {
  return (
    <TouchableOpacity style={styles.badge} onPress={onPress}>
      <Ionicons
        name={verified ? 'shield-checkmark' : 'shield-outline'}
        size={16}
        color={verified ? colors.success : colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: { padding: spacing.xs },
});

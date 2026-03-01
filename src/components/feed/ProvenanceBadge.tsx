import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/lib/theme';

type Props = { onPress: () => void; verified?: boolean };

export function ProvenanceBadge({ onPress, verified = true }: Props) {
  return (
    <TouchableOpacity style={styles.badge} onPress={onPress}>
      <Ionicons name={verified ? 'shield-checkmark' : 'shield-outline'} size={16} color={verified ? '#4CAF50' : '#999'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: { padding: spacing.xs },
});

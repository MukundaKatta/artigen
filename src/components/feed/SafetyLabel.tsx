import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography } from '@/lib/theme';

const LABEL_COLORS: Record<string, string> = {
  safe: '#4CAF50',
  sensitive: '#FF9800',
  mature: '#F44336',
  nsfw: '#9C27B0',
};

type Props = { labelType: string };

export function SafetyLabel({ labelType }: Props) {
  if (labelType === 'safe') return null;
  const color = LABEL_COLORS[labelType] || '#999';
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{labelType.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  text: { fontSize: 9, fontFamily: typography.bold },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/lib/theme';

type Props = { label: string; color?: string };

export function SubscriberBadge({ label, color = colors.gold }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  text: { fontSize: 10, fontFamily: typography.bold },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography } from '@/lib/theme';

type Props = { priceCents: number };

export function ListingBadge({ priceCents }: Props) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>${(priceCents / 100).toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  text: { color: '#fff', fontSize: 10, fontFamily: typography.bold },
});

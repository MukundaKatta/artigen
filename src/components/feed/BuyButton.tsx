import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = { priceCents: number; onPress: () => void };

export function BuyButton({ priceCents, onPress }: Props) {
  return (
    <AnimatedPressable
      style={styles.btn}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      scaleValue={0.92}
      accessibilityLabel={`Buy for $${(priceCents / 100).toFixed(2)}`}
      accessibilityRole="button"
    >
      <Ionicons name="cart-outline" size={14} color="#fff" />
      <Text style={styles.text}>${(priceCents / 100).toFixed(2)}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 6 },
  text: { color: '#fff', fontSize: fontSize.xs, fontFamily: typography.bold },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

const STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered'];
const DIGITAL_STEPS = ['pending', 'paid', 'delivered'];

type Props = { status: string; orderType: string };

export function OrderStatusTracker({ status, orderType }: Props) {
  const steps = orderType === 'digital_download' ? DIGITAL_STEPS : STEPS;
  const currentIndex = steps.indexOf(status);

  return (
    <View style={styles.container}>
      {steps.map((step, i) => (
        <View key={step} style={styles.step}>
          <View style={[styles.dot, i <= currentIndex && styles.dotActive]}>
            {i < currentIndex && <Ionicons name="checkmark" size={12} color="#fff" />}
          </View>
          <Text style={[styles.label, i <= currentIndex && styles.labelActive]}>{step}</Text>
          {i < steps.length - 1 && <View style={[styles.line, i < currentIndex && styles.lineActive]} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.md },
  step: { flex: 1, alignItems: 'center' },
  dot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  dotActive: { backgroundColor: colors.primary },
  label: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4, textTransform: 'capitalize' },
  labelActive: { color: colors.primary, fontFamily: typography.bold },
  line: { position: 'absolute', top: 12, left: '60%', right: '-40%', height: 2, backgroundColor: colors.border },
  lineActive: { backgroundColor: colors.primary },
});

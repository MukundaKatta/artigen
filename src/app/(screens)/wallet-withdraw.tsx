import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function WalletWithdrawScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Withdraw Funds</Text>
      <Text style={styles.desc}>Transfer your earnings to your bank account.</Text>
      <Text style={styles.coming}>Payout integration coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.xl, fontFamily: typography.bold, color: colors.text },
  desc: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
  coming: { fontSize: fontSize.sm, color: colors.primary, fontFamily: typography.medium, marginTop: spacing.lg },
});

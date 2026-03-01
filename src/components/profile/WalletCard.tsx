import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = {
  balanceCents: number;
  onPress: () => void;
};

export function WalletCard({ balanceCents, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Ionicons name="wallet-outline" size={20} color={colors.primary} />
        <Text style={styles.label}>Wallet Balance</Text>
      </View>
      <Text style={styles.balance}>${(balanceCents / 100).toFixed(2)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginHorizontal: spacing.md, marginVertical: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  label: { fontSize: fontSize.sm, color: colors.textSecondary, fontFamily: typography.medium },
  balance: { fontSize: fontSize.xl, fontFamily: typography.bold, color: colors.text },
});

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useWallet } from '@/hooks/useWallet';
import { WalletCard } from '@/components/profile/WalletCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function WalletScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { wallet, transactions, loading, balanceCents } = useWallet(user?.id);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <WalletCard balanceCents={balanceCents} onPress={() => {}} />
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(screens)/wallet-deposit')}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(screens)/wallet-withdraw')}>
          <Ionicons name="arrow-up-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Transaction History</Text>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.txRow}>
            <View style={styles.txInfo}>
              <Text style={styles.txType}>{item.type.replace(/_/g, ' ')}</Text>
              <Text style={styles.txDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <Text style={[styles.txAmount, item.type.includes('received') || item.type === 'deposit' || item.type === 'sale' ? styles.positive : styles.negative]}>
              {item.type.includes('received') || item.type === 'deposit' || item.type === 'sale' ? '+' : '-'}${(Math.abs(item.amount_cents) / 100).toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No transactions yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xl, padding: spacing.md },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionText: { fontSize: fontSize.sm, color: colors.primary, fontFamily: typography.medium },
  sectionTitle: { fontSize: fontSize.md, fontFamily: typography.bold, color: colors.text, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  txInfo: { flex: 1 },
  txType: { fontSize: fontSize.sm, color: colors.text, fontFamily: typography.medium, textTransform: 'capitalize' },
  txDate: { fontSize: fontSize.xs, color: colors.textSecondary },
  txAmount: { fontSize: fontSize.md, fontFamily: typography.bold },
  positive: { color: '#4CAF50' },
  negative: { color: '#F44336' },
  empty: { textAlign: 'center', color: colors.textSecondary, padding: spacing.xl },
});

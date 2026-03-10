import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/providers/AuthProvider';
import { useWallet } from '@/hooks/useWallet';
import { WalletCard } from '@/components/profile/WalletCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

function WalletSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <Skeleton width="100%" height={140} borderRadius={borderRadius.lg} style={{ marginHorizontal: spacing.md }} />
      <View style={styles.skeletonActions}>
        <Skeleton width={60} height={48} borderRadius={borderRadius.sm} />
        <Skeleton width={60} height={48} borderRadius={borderRadius.sm} />
      </View>
      <Skeleton width={140} height={16} style={{ marginLeft: spacing.md, marginTop: spacing.md }} />
      {[...Array(4)].map((_, i) => (
        <View key={i} style={styles.skeletonTxRow}>
          <View style={{ flex: 1 }}>
            <Skeleton width={120} height={14} />
            <Skeleton width={80} height={10} style={{ marginTop: 4 }} />
          </View>
          <Skeleton width={60} height={16} />
        </View>
      ))}
    </View>
  );
}

export default function WalletScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { wallet, transactions, loading, balanceCents } = useWallet(user?.id);

  if (loading) {
    return (
      <View style={styles.container}>
        <WalletSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.duration(400)}>
        <WalletCard balanceCents={balanceCents} onPress={() => {}} />
      </Animated.View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(screens)/wallet-deposit');
          }}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(screens)/wallet-withdraw');
          }}
        >
          <Ionicons name="arrow-up-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Transaction History</Text>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => {
          const isPositive = item.type.includes('received') || item.type === 'deposit' || item.type === 'sale';
          return (
            <Animated.View entering={FadeIn.delay(Math.min(index, 8) * 30).duration(250)}>
              <View style={styles.txRow}>
                <View style={styles.txInfo}>
                  <Text style={styles.txType}>{item.type.replace(/_/g, ' ')}</Text>
                  <Text style={styles.txDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={[styles.txAmount, isPositive ? styles.positive : styles.negative]}>
                  {isPositive ? '+' : '-'}${(Math.abs(item.amount_cents) / 100).toFixed(2)}
                </Text>
              </View>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="wallet-outline" size={32} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>Your transaction history will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  skeletonContainer: { padding: spacing.md },
  skeletonActions: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xl, padding: spacing.md },
  skeletonTxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

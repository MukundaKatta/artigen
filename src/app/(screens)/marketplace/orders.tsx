import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useOrders } from '@/hooks/useOrders';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function OrdersScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { orders, loading } = useOrders(user?.id);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <FlatList
      style={styles.container}
      data={orders}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.row} onPress={() => router.push(`/(screens)/marketplace/order/${item.id}`)}>
          <Text style={styles.title}>{item.listing?.title || 'Order'}</Text>
          <Text style={styles.status}>{item.status}</Text>
          <Text style={styles.amount}>${(item.amount_cents / 100).toFixed(2)}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No orders yet</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  row: { padding: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  title: { fontSize: fontSize.md, fontFamily: typography.bold, color: colors.text },
  status: { fontSize: fontSize.sm, color: colors.primary, textTransform: 'capitalize', marginTop: 2 },
  amount: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.textSecondary, padding: spacing.xl },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getOrder } from '@/services/order.service';
import { OrderStatusTracker } from '@/components/marketplace/OrderStatusTracker';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await getOrder(id!);
      setOrder(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading || !order) return <LoadingSpinner fullScreen />;

  return (
    <ScrollView style={styles.container}>
      <OrderStatusTracker status={order.status} orderType={order.order_type} />
      <View style={styles.info}>
        <Text style={styles.title}>{order.listing?.title || 'Order'}</Text>
        <Text style={styles.amount}>${(order.amount_cents / 100).toFixed(2)}</Text>
        <Text style={styles.date}>Ordered {new Date(order.created_at).toLocaleDateString()}</Text>
        {order.tracking_number && <Text style={styles.tracking}>Tracking: {order.tracking_number}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  info: { padding: spacing.md },
  title: { fontSize: fontSize.xl, fontFamily: typography.bold, color: colors.text },
  amount: { fontSize: fontSize.lg, color: colors.primary, fontFamily: typography.bold, marginTop: spacing.xs },
  date: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  tracking: { fontSize: fontSize.sm, color: colors.text, fontFamily: typography.medium, marginTop: spacing.sm },
});

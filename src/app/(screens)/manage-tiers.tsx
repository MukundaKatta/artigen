import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { deleteTier, getCreatorTiers } from '@/services/subscription.service';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function ManageTiersScreen() {
  const { user } = useAuth();
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTiers(); }, []);

  async function fetchTiers() {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await getCreatorTiers(user.id);
    setTiers(data || []);
    setLoading(false);
  }

  async function handleDelete(tierId: string) {
    Alert.alert('Delete Tier', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteTier(tierId);
        fetchTiers();
      }},
    ]);
  }

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={tiers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.tierRow}>
            <View style={styles.tierInfo}>
              <Text style={styles.tierName}>{item.name}</Text>
              <Text style={styles.tierPrice}>${(item.price_cents / 100).toFixed(2)}/mo</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No subscription tiers yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tierRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  tierInfo: { flex: 1 },
  tierName: { fontSize: fontSize.md, fontFamily: typography.bold, color: colors.text },
  tierPrice: { fontSize: fontSize.sm, color: colors.primary },
  empty: { textAlign: 'center', color: colors.textSecondary, padding: spacing.xl },
});

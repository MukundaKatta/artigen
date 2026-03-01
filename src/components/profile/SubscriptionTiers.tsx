import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Tier = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  benefits: string[];
  badge_label?: string;
  badge_color?: string;
};

type Props = {
  tiers: Tier[];
  onSubscribe: (tierId: string) => void;
  isSubscribed?: boolean;
  activeTierId?: string;
};

export function SubscriptionTiers({ tiers, onSubscribe, isSubscribed, activeTierId }: Props) {
  if (tiers.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subscription Tiers</Text>
      {tiers.map(tier => (
        <View key={tier.id} style={[styles.tierCard, activeTierId === tier.id && styles.tierActive]}>
          <View style={styles.tierHeader}>
            <Text style={styles.tierName}>{tier.name}</Text>
            <Text style={styles.tierPrice}>${(tier.price_cents / 100).toFixed(2)}/mo</Text>
          </View>
          {tier.description ? <Text style={styles.tierDesc}>{tier.description}</Text> : null}
          {(tier.benefits || []).map((b: string, i: number) => (
            <View key={i} style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={[styles.subscribeBtn, activeTierId === tier.id && styles.subscribedBtn]}
            onPress={() => onSubscribe(tier.id)}
            disabled={activeTierId === tier.id}
          >
            <Text style={[styles.subscribeBtnText, activeTierId === tier.id && styles.subscribedBtnText]}>
              {activeTierId === tier.id ? 'Subscribed' : 'Subscribe'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  title: { fontSize: fontSize.lg, fontFamily: typography.bold, color: colors.text, marginBottom: spacing.sm },
  tierCard: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  tierActive: { borderColor: colors.primary },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  tierName: { fontSize: fontSize.md, fontFamily: typography.bold, color: colors.text },
  tierPrice: { fontSize: fontSize.md, fontFamily: typography.bold, color: colors.primary },
  tierDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginVertical: 2 },
  benefitText: { fontSize: fontSize.sm, color: colors.text },
  subscribeBtn: { backgroundColor: colors.primary, borderRadius: 8, padding: spacing.sm, alignItems: 'center', marginTop: spacing.sm },
  subscribedBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  subscribeBtnText: { color: '#fff', fontFamily: typography.bold, fontSize: fontSize.sm },
  subscribedBtnText: { color: colors.textSecondary },
});

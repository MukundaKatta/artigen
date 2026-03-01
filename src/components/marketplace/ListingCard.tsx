import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = { listing: any; onPress: () => void };

export function ListingCard({ listing, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: listing.post?.media?.[0]?.media_url }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.price}>${(listing.price_cents / 100).toFixed(2)}</Text>
        <View style={styles.meta}>
          <Ionicons name={listing.listing_type === 'digital_download' ? 'cloud-download-outline' : 'print-outline'} size={14} color={colors.textSecondary} />
          <Text style={styles.type}>{listing.listing_type === 'digital_download' ? 'Digital' : 'Print'}</Text>
          {listing.sales_count > 0 && <Text style={styles.sales}>{listing.sales_count} sold</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 1 },
  info: { padding: spacing.sm },
  title: { fontSize: fontSize.sm, fontFamily: typography.bold, color: colors.text },
  price: { fontSize: fontSize.md, fontFamily: typography.bold, color: colors.primary, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  type: { fontSize: fontSize.xs, color: colors.textSecondary },
  sales: { fontSize: fontSize.xs, color: colors.textSecondary },
});

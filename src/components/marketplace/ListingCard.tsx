import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { selectionAsync } from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export type Listing = {
  id: string;
  title: string;
  price_cents: number;
  listing_type: 'digital_download' | 'print' | string;
  sales_count?: number;
  post?: { media?: { media_url: string }[] } | null;
};

type Props = { listing: Listing; onPress: () => void };

export const ListingCard = React.memo(function ListingCard({ listing, onPress }: Props) {
  const priceLabel = `$${(listing.price_cents / 100).toFixed(2)}`;
  const typeLabel = listing.listing_type === 'digital_download' ? 'Digital' : 'Print';
  return (
    <AnimatedPressable
      style={styles.card}
      onPress={() => {
        if (Platform.OS !== 'web') selectionAsync();
        onPress();
      }}
      scaleValue={0.97}
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}, ${priceLabel}, ${typeLabel}${listing.sales_count ? `, ${listing.sales_count} sold` : ''}`}
    >
      <Image source={{ uri: listing.post?.media?.[0]?.media_url }} style={styles.image} contentFit="cover" transition={200} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.price}>{priceLabel}</Text>
        <View style={styles.meta}>
          <Ionicons name={listing.listing_type === 'digital_download' ? 'cloud-download-outline' : 'print-outline'} size={14} color={colors.textSecondary} />
          <Text style={styles.type}>{typeLabel}</Text>
          {!!listing.sales_count && listing.sales_count > 0 && <Text style={styles.sales}>{listing.sales_count} sold</Text>}
        </View>
      </View>
    </AnimatedPressable>
  );
});

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

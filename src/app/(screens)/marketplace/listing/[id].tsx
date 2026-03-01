import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import * as marketplaceService from '@/services/marketplace.service';
import * as orderService from '@/services/order.service';
import { PrintOptions } from '@/components/marketplace/PrintOptions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPrint, setSelectedPrint] = useState<number>();

  useEffect(() => {
    (async () => {
      const { data } = await marketplaceService.getListing(id!);
      setListing(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading || !listing) return <LoadingSpinner fullScreen />;

  const handleBuy = async () => {
    if (!user?.id) return;
    await orderService.createOrder({
      buyerId: user.id,
      sellerId: listing.seller_id,
      listingId: listing.id,
      orderType: listing.listing_type,
      amountCents: listing.price_cents,
    });
    router.push('/(screens)/marketplace/orders');
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: listing.post?.media?.[0]?.media_url }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>${(listing.price_cents / 100).toFixed(2)}</Text>
        <Text style={styles.seller}>by @{listing.seller?.username}</Text>
        {listing.description ? <Text style={styles.desc}>{listing.description}</Text> : null}
      </View>
      {listing.listing_type === 'print_on_demand' && listing.print_options?.length > 0 && (
        <PrintOptions options={listing.print_options} selected={selectedPrint} onSelect={setSelectedPrint} />
      )}
      {listing.seller_id !== user?.id && (
        <TouchableOpacity style={styles.buyBtn} onPress={handleBuy}>
          <Text style={styles.buyText}>Buy Now</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  image: { width: '100%', aspectRatio: 1 },
  info: { padding: spacing.md },
  title: { fontSize: fontSize.xl, fontFamily: typography.bold, color: colors.text },
  price: { fontSize: fontSize.lg, fontFamily: typography.bold, color: colors.primary, marginTop: spacing.xs },
  seller: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  desc: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.sm },
  buyBtn: { backgroundColor: colors.primary, margin: spacing.md, padding: spacing.md, borderRadius: 8, alignItems: 'center' },
  buyText: { color: '#fff', fontFamily: typography.bold, fontSize: fontSize.md },
});

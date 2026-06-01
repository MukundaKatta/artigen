import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { NotificationFeedbackType, notificationAsync } from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/providers/AuthProvider';
import { getListing } from '@/services/marketplace.service';
import { createOrder } from '@/services/order.service';
import { PrintOptions } from '@/components/marketplace/PrintOptions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [selectedPrint, setSelectedPrint] = useState<number>();

  useEffect(() => {
    (async () => {
      const { data } = await getListing(id!);
      setListing(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading || !listing) return <LoadingSpinner fullScreen />;

  const handleBuy = async () => {
    if (!user?.id) return;
    if (Platform.OS !== 'web') notificationAsync(NotificationFeedbackType.Success);
    setBuying(true);
    await createOrder({
      buyerId: user.id,
      sellerId: listing.seller_id,
      listingId: listing.id,
      orderType: listing.listing_type,
      amountCents: listing.price_cents,
    });
    setBuying(false);
    router.push('/(screens)/marketplace/orders');
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: listing.post?.media?.[0]?.media_url }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      <Animated.View entering={FadeInUp.duration(400)} style={styles.info}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>${(listing.price_cents / 100).toFixed(2)}</Text>
        <Text style={styles.seller}>by @{listing.seller?.username}</Text>
        {listing.description ? <Text style={styles.desc}>{listing.description}</Text> : null}
      </Animated.View>
      {listing.listing_type === 'print_on_demand' && listing.print_options?.length > 0 && (
        <PrintOptions options={listing.print_options} selected={selectedPrint} onSelect={setSelectedPrint} />
      )}
      {listing.seller_id !== user?.id && (
        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <Button
            title="Buy Now"
            onPress={handleBuy}
            loading={buying}
            size="lg"
            style={styles.buyBtn}
          />
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  image: { width: '100%', aspectRatio: 1, backgroundColor: colors.backgroundSecondary },
  info: { padding: spacing.lg },
  title: { fontSize: fontSize.xl, fontFamily: typography.bold, color: colors.text },
  price: { fontSize: fontSize.lg, fontFamily: typography.bold, color: colors.primary, marginTop: spacing.xs },
  seller: { fontSize: fontSize.sm, fontFamily: typography.regular, color: colors.textSecondary, marginTop: 2 },
  desc: { fontSize: fontSize.md, fontFamily: typography.regular, color: colors.text, marginTop: spacing.md, lineHeight: 22 },
  buyBtn: { marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.xl },
});

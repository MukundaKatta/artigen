import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/providers/AuthProvider';
import {
  CREDIT_PACKAGES, getUserCredits, openStripeCheckout, createRazorpayOrder,
} from '@/services/credits.service';
import { colors, spacing, fontSize, typography, borderRadius, shadows } from '@/lib/theme';

export default function BuyCreditsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string }>();

  const [balance, setBalance] = useState<number | null>(null);
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);

  const loadBalance = useCallback(async () => {
    if (!user) return;
    const b = await getUserCredits(user.id);
    setBalance(b);
  }, [user]);

  useEffect(() => { loadBalance(); }, [loadBalance]);

  useEffect(() => {
    if (params.status === 'success') {
      Alert.alert('Credits Added!', 'Your credits have been added to your account.');
      loadBalance();
    } else if (params.status === 'cancelled') {
      Alert.alert('Payment Cancelled', 'Your payment was not completed.');
    }
  }, [params.status, loadBalance]);

  async function handleStripe(packageId: string) {
    setLoadingPkg(`stripe_${packageId}`);
    const { error } = await openStripeCheckout(packageId);
    setLoadingPkg(null);
    if (error) Alert.alert('Error', error);
    else loadBalance();
  }

  async function handleRazorpay(packageId: string) {
    setLoadingPkg(`rzp_${packageId}`);
    const { order, error } = await createRazorpayOrder(packageId);
    setLoadingPkg(null);
    if (error) { Alert.alert('Error', error); return; }

    // Open Razorpay hosted checkout
    const url = `https://api.razorpay.com/v1/checkout/embedded?key_id=${order.key_id}&order_id=${order.order_id}`;
    await WebBrowser.openBrowserAsync(url);
    // Reload balance after return
    setTimeout(loadBalance, 2000);
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Buy AI Credits' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Balance Banner */}
        <LinearGradient
          colors={['#833AB4', '#E1306C', '#F77737']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.balanceBanner}
        >
          <Ionicons name="sparkles" size={28} color="#fff" />
          <View style={styles.balanceTexts}>
            <Text style={styles.balanceLabel}>Your Credits</Text>
            <Text style={styles.balanceNum}>
              {balance === null ? '—' : balance.toLocaleString()}
            </Text>
          </View>
          <Pressable onPress={loadBalance} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={18} color="rgba(255,255,255,0.8)" />
          </Pressable>
        </LinearGradient>

        {/* What credits buy */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What can you do with credits?</Text>
          {[
            { icon: 'sparkles', label: 'DALL-E 3 HD', cost: '80 credits' },
            { icon: 'color-palette-outline', label: 'Gemini Imagen 3', cost: '25 credits' },
            { icon: 'flash', label: 'Flux Dev (Replicate)', cost: '30 credits' },
            { icon: 'chatbubble-ellipses-outline', label: 'AI Assistant (per message)', cost: '5 credits' },
            { icon: 'build-outline', label: 'HuggingFace models', cost: 'FREE' },
          ].map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <Ionicons name={item.icon as any} size={16} color={colors.primary} />
              <Text style={styles.infoRowLabel}>{item.label}</Text>
              <Text style={[styles.infoRowCost, item.cost === 'FREE' && styles.freeLabel]}>
                {item.cost}
              </Text>
            </View>
          ))}
        </View>

        {/* New users get 100 free */}
        <View style={styles.freeCard}>
          <Ionicons name="gift-outline" size={20} color="#58C322" />
          <Text style={styles.freeCardText}>
            New users get <Text style={{ fontFamily: typography.bold }}>100 free starter credits</Text> on signup
          </Text>
        </View>

        {/* Packages */}
        <Text style={styles.sectionTitle}>Choose a Package</Text>

        {CREDIT_PACKAGES.map((pkg) => (
          <View key={pkg.id} style={[styles.pkgCard, pkg.popular && styles.pkgCardPopular]}>
            {pkg.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
              </View>
            )}
            <View style={styles.pkgHeader}>
              <View>
                <Text style={styles.pkgLabel}>{pkg.label}</Text>
                <Text style={styles.pkgCredits}>{pkg.credits.toLocaleString()} credits</Text>
              </View>
              <View style={styles.pkgPricing}>
                <Text style={styles.pkgUsd}>${pkg.price_usd}</Text>
                {pkg.bonus > 0 && (
                  <View style={styles.bonusBadge}>
                    <Text style={styles.bonusBadgeText}>+{pkg.bonus}% bonus</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.pkgButtons}>
              <Pressable
                style={[styles.payBtn, styles.stripeBtn]}
                onPress={() => handleStripe(pkg.id)}
                disabled={!!loadingPkg}
              >
                {loadingPkg === `stripe_${pkg.id}` ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="card-outline" size={16} color="#fff" />
                    <Text style={styles.payBtnText}>Pay with Card</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={[styles.payBtn, styles.razorpayBtn]}
                onPress={() => handleRazorpay(pkg.id)}
                disabled={!!loadingPkg}
              >
                {loadingPkg === `rzp_${pkg.id}` ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="phone-portrait-outline" size={16} color="#fff" />
                    <Text style={styles.payBtnText}>UPI / India</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        ))}

        <Text style={styles.disclaimer}>
          Credits never expire. All payments are processed securely via Stripe or Razorpay.
          No refunds after credits are used.
        </Text>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  balanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  balanceTexts: { flex: 1 },
  balanceLabel: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', fontFamily: typography.medium },
  balanceNum: { fontSize: 32, fontFamily: typography.bold, color: '#fff', lineHeight: 36 },
  refreshBtn: { padding: spacing.sm },
  infoCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  infoTitle: { fontSize: fontSize.md, fontFamily: typography.semiBold, color: colors.text, marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  infoRowLabel: { flex: 1, fontSize: fontSize.sm, fontFamily: typography.regular, color: colors.text },
  infoRowCost: { fontSize: fontSize.sm, fontFamily: typography.medium, color: colors.textSecondary },
  freeLabel: { color: '#58C322' },
  freeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(88,195,34,0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(88,195,34,0.2)',
  },
  freeCardText: { flex: 1, fontSize: fontSize.sm, fontFamily: typography.regular, color: colors.text, lineHeight: 18 },
  sectionTitle: { fontSize: fontSize.lg, fontFamily: typography.semiBold, color: colors.text, marginBottom: spacing.md },
  pkgCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    overflow: 'hidden',
  },
  pkgCardPopular: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  popularBadge: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.sm,
  },
  popularBadgeText: { fontSize: fontSize.xs, fontFamily: typography.bold, color: '#fff' },
  pkgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  pkgLabel: { fontSize: fontSize.lg, fontFamily: typography.bold, color: colors.text },
  pkgCredits: { fontSize: fontSize.sm, fontFamily: typography.regular, color: colors.textSecondary, marginTop: 2 },
  pkgPricing: { alignItems: 'flex-end' },
  pkgUsd: { fontSize: fontSize.xxl, fontFamily: typography.bold, color: colors.text },
  bonusBadge: { backgroundColor: 'rgba(88,195,34,0.12)', borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2, marginTop: spacing.xs },
  bonusBadgeText: { fontSize: fontSize.xs, fontFamily: typography.semiBold, color: '#58C322' },
  pkgButtons: { flexDirection: 'row', gap: spacing.sm },
  payBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  stripeBtn: { backgroundColor: '#635BFF' },
  razorpayBtn: { backgroundColor: '#2D82C7' },
  payBtnText: { color: '#fff', fontFamily: typography.semiBold, fontSize: fontSize.sm },
  disclaimer: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: spacing.md,
  },
});

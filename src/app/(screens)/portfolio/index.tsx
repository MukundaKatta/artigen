import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/providers/AuthProvider';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioSection } from '@/components/portfolio/PortfolioSection';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

function PortfolioSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <View style={{ padding: spacing.lg }}>
        <Skeleton width="100%" height={60} borderRadius={borderRadius.md} />
      </View>
      <Skeleton width={140} height={18} style={{ marginLeft: spacing.lg }} />
      <View style={styles.skeletonGrid}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} width="47%" height={160} borderRadius={borderRadius.md} />
        ))}
      </View>
    </View>
  );
}

export default function PortfolioViewRoute() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const { user, profile } = useAuth();
  const targetUserId = userId || user?.id;
  const { sections, loading } = usePortfolio(targetUserId);
  const isOwner = targetUserId === user?.id;

  const portfolioBio = profile?.portfolio_bio;
  const portfolioEmail = profile?.portfolio_contact_email;

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Portfolio' }} />
        <PortfolioSkeleton />
      </View>
    );
  }

  if (sections.length === 0) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Portfolio' }} />
        <View style={styles.emptyIconCircle}>
          <Ionicons name="images-outline" size={32} color={colors.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>No portfolio sections yet</Text>
        <Text style={styles.emptySubtitle}>Showcase your best work</Text>
        {isOwner && (
          <TouchableOpacity
            style={styles.setupButton}
            onPress={() => router.push('/(screens)/portfolio/edit')}
          >
            <Text style={styles.setupButtonText}>Set Up Portfolio</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Portfolio',
          headerRight: isOwner
            ? () => (
                <TouchableOpacity onPress={() => router.push('/(screens)/portfolio/edit')}>
                  <Ionicons name="create-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
              )
            : undefined,
        }}
      />

      {/* Bio Section */}
      {portfolioBio ? (
        <Animated.View entering={FadeInUp.duration(400)} style={styles.bioSection}>
          <Text style={styles.bioText}>{portfolioBio}</Text>
          {portfolioEmail ? <Text style={styles.contactEmail}>{portfolioEmail}</Text> : null}
        </Animated.View>
      ) : null}

      {/* Portfolio Sections */}
      {sections.map((section, index) => (
        <Animated.View key={section.id} entering={FadeIn.delay(index * 100).duration(300)}>
          <PortfolioSection
            section={section}
            items={section.items || []}
            onItemPress={(item) => router.push(`/(screens)/post/${item.post_id}`)}
          />
        </Animated.View>
      ))}

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skeletonContainer: {
    flex: 1,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  setupButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  setupButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
  },
  bioSection: {
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginBottom: spacing.lg,
  },
  bioText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 22,
  },
  contactEmail: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  footer: {
    height: 40,
  },
});

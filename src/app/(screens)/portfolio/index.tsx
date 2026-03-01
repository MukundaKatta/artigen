import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioSection } from '@/components/portfolio/PortfolioSection';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function PortfolioViewRoute() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const { user, profile } = useAuth();
  const targetUserId = userId || user?.id;
  const { sections, loading } = usePortfolio(targetUserId);
  const isOwner = targetUserId === user?.id;

  const portfolioBio = (profile as any)?.portfolio_bio;
  const portfolioEmail = (profile as any)?.portfolio_contact_email;

  if (loading) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Portfolio' }} />
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (sections.length === 0) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Portfolio' }} />
        <Ionicons name="images-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No portfolio sections yet</Text>
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
        <View style={styles.bioSection}>
          <Text style={styles.bioText}>{portfolioBio}</Text>
          {portfolioEmail ? (
            <Text style={styles.contactEmail}>{portfolioEmail}</Text>
          ) : null}
        </View>
      ) : null}

      {/* Portfolio Sections */}
      {sections.map((section) => (
        <PortfolioSection
          key={section.id}
          section={section}
          items={section.items || []}
          onItemPress={(item) =>
            router.push(`/(screens)/post/${item.post_id}`)
          }
        />
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  setupButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
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

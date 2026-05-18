import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = {
  children: React.ReactNode;
  fallbackTitle?: string;
};

/**
 * Thin wrapper around the canonical ErrorBoundary that renders a smaller
 * inline fallback (no go-home button) suitable for feature-scoped wrapping.
 */
export function FeatureErrorBoundary({ children, fallbackTitle }: Props) {
  const fallback = (
    <View style={styles.container}>
      <Text style={styles.title}>{fallbackTitle ?? 'Something went wrong'}</Text>
      <Text style={styles.message}>This section failed to load. Pull to refresh.</Text>
    </View>
  );

  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

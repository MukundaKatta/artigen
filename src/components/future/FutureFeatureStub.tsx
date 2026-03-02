import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  title: string;
  summary: string;
  enabled: boolean;
  onPrimaryAction: () => void;
  primaryLabel?: string;
};

export function FutureFeatureStub({
  title,
  summary,
  enabled,
  onPrimaryAction,
  primaryLabel = 'Join Early Access',
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Ionicons name={enabled ? 'rocket' : 'construct-outline'} size={30} color={enabled ? colors.primary : colors.warning} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.summary}>{summary}</Text>
        <View style={[styles.badge, enabled ? styles.badgeEnabled : styles.badgeDisabled]}>
          <Text style={styles.badgeText}>{enabled ? 'FLAG ENABLED' : 'FLAG DISABLED'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Phase 1 Status</Text>
        <Text style={styles.cardText}>
          Contracts, telemetry hooks, and route scaffolding are in place. Production inference and distribution integrations are pending implementation.
        </Text>
      </View>

      <Button title={primaryLabel} onPress={onPrimaryAction} size="lg" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  hero: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    color: colors.text,
  },
  summary: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeEnabled: { backgroundColor: 'rgba(88, 195, 34, 0.16)' },
  badgeDisabled: { backgroundColor: 'rgba(255, 187, 0, 0.18)' },
  badgeText: {
    fontSize: fontSize.xs,
    fontFamily: typography.bold,
    color: colors.text,
    letterSpacing: 0.4,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  cardText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

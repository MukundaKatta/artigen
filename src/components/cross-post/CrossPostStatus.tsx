import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlatformIcon, getPlatformLabel } from './PlatformIcon';
import type { CrossPost } from '@/services/cross-post.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  crossPosts: CrossPost[];
};

const STATUS_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
  pending: { icon: 'time-outline', color: colors.warning, label: 'Pending' },
  posting: { icon: 'cloud-upload-outline', color: colors.primary, label: 'Posting...' },
  posted: { icon: 'checkmark-circle', color: colors.success, label: 'Posted' },
  failed: { icon: 'close-circle', color: colors.error, label: 'Failed' },
};

export function CrossPostStatus({ crossPosts }: Props) {
  if (crossPosts.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Cross-Post Status</Text>
      {crossPosts.map((cp) => {
        const config = STATUS_CONFIG[cp.status] || STATUS_CONFIG.pending;
        return (
          <View key={cp.id} style={styles.row}>
            <PlatformIcon platform={cp.platform} size={20} />
            <Text style={styles.platformName}>{getPlatformLabel(cp.platform)}</Text>
            <View style={styles.statusContainer}>
              <Ionicons name={config.icon} size={16} color={config.color} />
              <Text style={[styles.statusText, { color: config.color }]}>
                {config.label}
              </Text>
            </View>
            {cp.error_message ? (
              <Text style={styles.errorText} numberOfLines={1}>
                {cp.error_message}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    gap: spacing.md,
  },
  heading: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  platformName: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
  },
  errorText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';
import type { ExhibitionWithCurator } from '@/services/exhibition.service';

type Props = {
  exhibition: ExhibitionWithCurator;
};

const STATUS_COLORS: Record<string, string> = {
  accepting: colors.success,
  curating: colors.warning,
  live: colors.primary,
  archived: colors.textSecondary,
};

const STATUS_LABELS: Record<string, string> = {
  accepting: 'Accepting',
  curating: 'Curating',
  live: 'Live',
  archived: 'Archived',
};

export function ExhibitionCard({ exhibition }: Props) {
  const router = useRouter();

  function handlePress() {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push(`/(screens)/exhibition/${exhibition.id}`);
  }

  return (
    <AnimatedPressable style={styles.card} onPress={handlePress} scaleValue={0.97}>
      {exhibition.cover_image_url ? (
        <Image
          source={{ uri: exhibition.cover_image_url }}
          style={styles.cover}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Ionicons name="images-outline" size={32} color={colors.textSecondary} />
        </View>
      )}

      {/* Status badge overlay */}
      <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[exhibition.status] }]}>
        <Text style={styles.statusText}>{STATUS_LABELS[exhibition.status]}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{exhibition.title}</Text>

        {exhibition.theme && (
          <View style={styles.themeRow}>
            <Ionicons name="color-palette-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.themeText} numberOfLines={1}>{exhibition.theme}</Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="images-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {formatNumber(exhibition.submission_count)} submissions
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="eye-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.metaText}>{formatNumber(exhibition.view_count)}</Text>
          </View>
        </View>

        {/* Curator */}
        <View style={styles.curatorRow}>
          <Image
            source={
              exhibition.curator.avatar_url
                ? { uri: exhibition.curator.avatar_url }
                : require('../../../assets/images/default-avatar.png')
            }
            style={styles.curatorAvatar}
            contentFit="cover"
            transition={200}
          />
          <Text style={styles.curatorName}>@{exhibition.curator.username}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cover: {
    width: '100%',
    height: 140,
    backgroundColor: colors.border,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontFamily: typography.bold,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  themeText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  curatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  curatorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  curatorName: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
});

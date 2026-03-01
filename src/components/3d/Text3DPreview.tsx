import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  thumbnailUrl?: string | null;
  modelUrl?: string | null;
};

export function Text3DPreview({ thumbnailUrl, modelUrl }: Props) {
  if (!thumbnailUrl) {
    return (
      <View style={styles.placeholder}>
        <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.placeholderText}>Your 3D model will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: thumbnailUrl }}
        style={styles.thumbnail}
        contentFit="contain"
      />
      <View style={styles.rotateHint}>
        <Ionicons name="refresh-outline" size={14} color={colors.textLight} />
        <Text style={styles.rotateHintText}>3D model generated</Text>
      </View>
      {modelUrl && (
        <View style={styles.modelBadge}>
          <Ionicons name="cube" size={12} color={colors.textLight} />
          <Text style={styles.modelBadgeText}>3D</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  placeholderText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  rotateHint: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  rotateHintText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textLight,
  },
  modelBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  modelBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    color: colors.textLight,
  },
});

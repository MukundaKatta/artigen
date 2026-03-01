import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PortfolioItem } from '@/services/portfolio.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  item: PortfolioItem;
  onPress?: () => void;
  onRemove?: () => void;
};

export function PortfolioItemCard({ item, onPress, onRemove }: Props) {
  const media = item.post?.media?.[0];
  const imageUrl = media?.media_url || media?.url;
  const caption = item.caption_override || item.post?.caption || '';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
        </View>
      )}
      {caption ? (
        <View style={styles.captionOverlay}>
          <Text style={styles.captionText} numberOfLines={2}>
            {caption}
          </Text>
        </View>
      ) : null}
      {onRemove ? (
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Ionicons name="close-circle" size={22} color={colors.error} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 200,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  captionText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: '#FFFFFF',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 11,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import type { PortfolioItem } from '@/services/portfolio.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  item: PortfolioItem;
  onPress?: () => void;
  onRemove?: () => void;
};

export function PortfolioItemCard({ item, onPress, onRemove }: Props) {
  const media = item.post?.media?.[0];
  const imageUrl = media?.media_url;
  const caption = item.caption_override || item.post?.caption || '';

  return (
    <AnimatedPressable
      style={styles.container}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.selectionAsync();
        onPress?.();
      }}
      scaleValue={0.97}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
        </View>
      )}
      {caption ? (
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.captionOverlay}>
          <Text style={styles.captionText} numberOfLines={2}>
            {caption}
          </Text>
        </LinearGradient>
      ) : null}
      {onRemove ? (
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Ionicons name="close-circle" size={22} color={colors.error} />
        </TouchableOpacity>
      ) : null}
    </AnimatedPressable>
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    paddingTop: spacing.xl,
  },
  captionText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textLight,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 11,
  },
});

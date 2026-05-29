import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { SCREEN_WIDTH } from '@/lib/constants';

const COLS = 4;
const GAP = spacing.sm;
const STICKER_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - GAP * (COLS - 1)) / COLS;

type Sticker = {
  id: string;
  image_url: string;
  label?: string | null;
};

type Props = {
  stickers: Sticker[];
  onPress?: (sticker: Sticker) => void;
  onLongPress?: (sticker: Sticker) => void;
};

export function StickerGrid({ stickers, onPress, onLongPress }: Props) {
  return (
    <View style={styles.grid}>
      {stickers.map((sticker) => (
        <TouchableOpacity
          key={sticker.id}
          style={styles.stickerItem}
          onPress={() => onPress?.(sticker)}
          onLongPress={() => onLongPress?.(sticker)}
          activeOpacity={0.7}
          accessibilityRole="imagebutton"
          accessibilityLabel={sticker.label || 'Sticker'}
        >
          <Image
            source={{ uri: sticker.image_url }}
            style={styles.stickerImage}
            contentFit="contain"
          />
          {sticker.label ? (
            <Text style={styles.label} numberOfLines={1}>{sticker.label}</Text>
          ) : null}
        </TouchableOpacity>
      ))}
      {stickers.length === 0 && (
        <Text style={styles.empty}>No stickers yet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: GAP,
  },
  stickerItem: {
    width: STICKER_SIZE,
    alignItems: 'center',
    gap: spacing.xs,
  },
  stickerImage: {
    width: STICKER_SIZE,
    height: STICKER_SIZE,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  empty: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.xl,
    width: '100%',
  },
});

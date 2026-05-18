import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius, withOpacity } from '@/lib/theme';
import type { StorySticker } from '@/types';
import { logger } from '@/lib/logger';

type Props = {
  sticker: StorySticker;
  userId: string;
  onRespond: (response: Record<string, unknown>) => void;
};

export function LinkSticker({ sticker, onRespond }: Props) {
  const config = sticker.config as { url: string; title?: string };

  function handlePress() {
    onRespond({ clicked: true });
    if (config.url) {
      Linking.openURL(config.url).catch((err) => logger.warn('Failed to open URL:', err));
    }
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Ionicons name="link" size={16} color={colors.textLight} />
      <Text style={styles.text} numberOfLines={1}>
        {config.title || config.url || 'Link'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(colors.backgroundDark, 0.7),
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    maxWidth: 200,
  },
  text: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textLight,
    flex: 1,
  },
});

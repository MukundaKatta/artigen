import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius, shadows } from '@/lib/theme';

type Props = {
  pack: {
    id: string;
    name: string;
    cover_url?: string;
    sticker_count?: number;
    creator?: { username?: string };
  };
  isSaved?: boolean;
  onPress: () => void;
  onSave?: () => void;
};

export function StickerPackCard({ pack, isSaved, onPress, onSave }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.8}>
      <View style={styles.coverContainer}>
        {pack.cover_url ? (
          <Image source={{ uri: pack.cover_url }} style={styles.cover} contentFit="cover" />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="happy-outline" size={32} color={colors.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{pack.name}</Text>
        <Text style={styles.meta}>
          {pack.sticker_count ?? 0} stickers
          {pack.creator?.username ? ` · @${pack.creator.username}` : ''}
        </Text>
      </View>
      {onSave && (
        <TouchableOpacity onPress={onSave} style={styles.saveButton} activeOpacity={0.7}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  coverContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  cover: {
    width: 56,
    height: 56,
  },
  coverPlaceholder: {
    width: 56,
    height: 56,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  saveButton: {
    padding: spacing.sm,
  },
});

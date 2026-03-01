import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { UserAvatar } from '@/services/avatar.service';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = spacing.sm;
const GRID_PADDING = spacing.lg;
const NUM_COLUMNS = 3;
const ITEM_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

type Props = {
  avatars: UserAvatar[];
  onSelect: (avatar: UserAvatar) => void;
  onUse: (avatarId: string) => void;
};

export function AvatarGrid({ avatars, onSelect, onUse }: Props) {
  if (avatars.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={40} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No saved avatars yet</Text>
        <Text style={styles.emptySubtext}>Generate and save avatars to see them here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Avatars</Text>
      <View style={styles.grid}>
        {avatars.map((avatar) => (
          <TouchableOpacity
            key={avatar.id}
            style={styles.avatarItem}
            onPress={() => onSelect(avatar)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: avatar.image_url }}
              style={styles.avatarImage}
              contentFit="cover"
              transition={200}
            />
            {avatar.is_active && (
              <View style={styles.activeBadge}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              </View>
            )}
            <TouchableOpacity
              style={styles.useButton}
              onPress={() => onUse(avatar.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.useButtonText}>
                {avatar.is_active ? 'Active' : 'Use'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: GRID_PADDING,
    gap: GRID_GAP,
  },
  avatarItem: {
    width: ITEM_SIZE,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
  },
  avatarImage: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: borderRadius.lg,
  },
  activeBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: 10,
  },
  useButton: {
    paddingVertical: spacing.xs,
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  useButtonText: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

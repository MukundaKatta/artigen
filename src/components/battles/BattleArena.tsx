import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Avatar } from '@/components/ui/Avatar';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { BattleEntryWithUser } from '@/services/battle.service';

type Props = {
  entries: BattleEntryWithUser[];
};

export function BattleArena({ entries }: Props) {
  const left = entries[0] || null;
  const right = entries[1] || null;

  return (
    <View style={styles.container}>
      {/* Left entry */}
      <View style={styles.side}>
        {left ? (
          <>
            <Image
              source={{ uri: left.image_url || undefined }}
              style={styles.entryImage}
              contentFit="cover"
            />
            <View style={styles.entryInfo}>
              <Avatar uri={left.user?.avatar_url} size="sm" />
              <Text style={styles.entryUsername} numberOfLines={1}>
                {left.user?.username}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Awaiting entry</Text>
          </View>
        )}
      </View>

      {/* VS badge */}
      <View style={styles.vsBadge}>
        <Text style={styles.vsText}>VS</Text>
      </View>

      {/* Right entry */}
      <View style={styles.side}>
        {right ? (
          <>
            <Image
              source={{ uri: right.image_url || undefined }}
              style={styles.entryImage}
              contentFit="cover"
            />
            <View style={styles.entryInfo}>
              <Avatar uri={right.user?.avatar_url} size="sm" />
              <Text style={styles.entryUsername} numberOfLines={1}>
                {right.user?.username}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Awaiting entry</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  side: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
  },
  entryImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.border,
  },
  entryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  entryUsername: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
    flex: 1,
  },
  vsBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: '50%',
    marginLeft: -20,
    zIndex: 10,
    borderWidth: 3,
    borderColor: colors.background,
  },
  vsText: {
    fontSize: fontSize.sm,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.textLight,
  },
  placeholder: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.border + '40',
  },
  placeholderText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
});

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';
import type { Community } from '@/types';

type Props = {
  community: Community;
};

export function CommunityCard({ community }: Props) {
  const router = useRouter();

  function handlePress() {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push(`/(screens)/community/${community.id}`);
  }

  return (
    <AnimatedPressable
      style={styles.card}
      onPress={handlePress}
      scaleValue={0.97}
      accessibilityRole="button"
      accessibilityLabel={`${community.name}, ${formatNumber(community.member_count)} ${community.member_count === 1 ? 'member' : 'members'}${community.is_private ? ', private' : ''}`}
    >
      <Image
        source={
          community.avatar_url
            ? { uri: community.avatar_url }
            : require('../../../assets/images/default-avatar.png')
        }
        style={styles.avatar}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {community.name}
        </Text>
        <Text style={styles.memberCount}>
          {formatNumber(community.member_count)}{' '}
          {community.member_count === 1 ? 'member' : 'members'}
        </Text>
        {community.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {community.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      {community.is_private && (
        <Ionicons
          name="lock-closed"
          size={14}
          color={colors.textSecondary}
          style={styles.lockIcon}
        />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.border,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  memberCount: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: spacing.xs,
  },
  tag: {
    backgroundColor: 'rgba(0, 149, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.primary,
  },
  lockIcon: {
    marginLeft: spacing.sm,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';
import { SCREEN_WIDTH } from '@/lib/constants';
import type { Community } from '@/types';

type Props = {
  community: Community;
  isMember: boolean;
  isOwner: boolean;
  joining: boolean;
  onToggleJoin: () => void;
};

export function CommunityHeader({ community, isMember, isOwner, joining, onToggleJoin }: Props) {
  const COVER_HEIGHT = 160;

  return (
    <View style={styles.container}>
      {/* Cover Image */}
      <View style={[styles.coverContainer, { height: COVER_HEIGHT }]}>
        {community.cover_url ? (
          <Image
            source={{ uri: community.cover_url }}
            style={styles.coverImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={
            community.avatar_url
              ? { uri: community.avatar_url }
              : require('../../../assets/images/default-avatar.png')
          }
          style={styles.avatar}
          contentFit="cover"
        />
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{community.name}</Text>
          {community.is_private && (
            <Ionicons name="lock-closed" size={16} color={colors.textSecondary} />
          )}
        </View>

        <Text style={styles.memberCount}>
          {formatNumber(community.member_count)}{' '}
          {community.member_count === 1 ? 'member' : 'members'}
        </Text>

        {community.description ? (
          <Text style={styles.description}>{community.description}</Text>
        ) : null}

        {community.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {community.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Join / Leave Button */}
        {!isOwner && (
          <TouchableOpacity
            style={[styles.joinButton, isMember && styles.joinedButton]}
            onPress={onToggleJoin}
            disabled={joining}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={isMember ? `Leave ${community.name}` : `Join ${community.name}`}
            accessibilityState={{ selected: isMember, disabled: joining, busy: joining }}
          >
            <Text style={[styles.joinButtonText, isMember && styles.joinedButtonText]}>
              {joining ? '...' : isMember ? 'Joined' : 'Join'}
            </Text>
          </TouchableOpacity>
        )}

        {isOwner && (
          <View style={styles.ownerBadge}>
            <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
            <Text style={styles.ownerBadgeText}>Owner</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  coverContainer: {
    width: SCREEN_WIDTH,
    backgroundColor: colors.backgroundSecondary,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.background,
    backgroundColor: colors.backgroundSecondary,
  },
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: colors.text,
  },
  memberCount: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  description: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: 'rgba(0, 149, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.primary,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    minWidth: 120,
    alignItems: 'center',
  },
  joinedButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  joinButtonText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.textLight,
  },
  joinedButtonText: {
    color: colors.text,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    backgroundColor: 'rgba(0, 149, 246, 0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  ownerBadgeText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.primary,
  },
});

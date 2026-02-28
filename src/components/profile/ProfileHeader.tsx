import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { colors, fontSize, spacing, typography } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';
import type { Profile } from '@/types/database';

type Props = {
  profile: Profile;
  isCurrentUser: boolean;
  isFollowing: boolean;
  followLoading: boolean;
  onFollowPress: () => void;
  onEditPress: () => void;
  onFollowersPress: () => void;
  onFollowingPress: () => void;
};

export function ProfileHeader({
  profile,
  isCurrentUser,
  isFollowing,
  followLoading,
  onFollowPress,
  onEditPress,
  onFollowersPress,
  onFollowingPress,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Top row: Avatar + Stats */}
      <View style={styles.topRow}>
        <Avatar uri={profile.avatar_url} size="xl" />
        <View style={styles.stats}>
          <StatItem label="Posts" value={profile.posts_count} />
          <StatItem label="Followers" value={profile.followers_count} onPress={onFollowersPress} />
          <StatItem label="Following" value={profile.following_count} onPress={onFollowingPress} />
        </View>
      </View>

      {/* Name and Bio */}
      <View style={styles.info}>
        <Text style={styles.fullName}>{profile.full_name}</Text>
        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
        {profile.website ? (
          <Text style={styles.website}>{profile.website}</Text>
        ) : null}
      </View>

      {/* Action Button */}
      <View style={styles.actionRow}>
        {isCurrentUser ? (
          <Button
            title="Edit Profile"
            variant="outline"
            size="sm"
            onPress={onEditPress}
            style={styles.actionButton}
          />
        ) : (
          <Button
            title={isFollowing ? 'Following' : 'Follow'}
            variant={isFollowing ? 'outline' : 'primary'}
            size="sm"
            loading={followLoading}
            onPress={onFollowPress}
            style={styles.actionButton}
          />
        )}
      </View>
    </View>
  );
}

function StatItem({
  label,
  value,
  onPress,
}: {
  label: string;
  value: number;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{formatNumber(value)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.text,
    marginTop: 2,
  },
  info: {
    marginTop: spacing.sm,
  },
  fullName: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  bio: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    marginTop: 2,
  },
  website: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.link,
    marginTop: 2,
  },
  actionRow: {
    marginTop: spacing.md,
  },
  actionButton: {
    width: '100%',
  },
});

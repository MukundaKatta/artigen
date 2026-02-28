import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { FollowButton } from '@/components/profile/FollowButton';
import { useFollow } from '@/hooks/useFollow';
import { colors, fontSize, spacing, typography, borderRadius } from '@/lib/theme';
import type { SuggestedUser } from '@/services/suggestion.service';

type Props = {
  user: SuggestedUser;
  currentUserId: string;
};

export function SuggestedUserCard({ user, currentUserId }: Props) {
  const router = useRouter();
  const { isFollowing, loading, toggleFollow } = useFollow(currentUserId, user.id);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(screens)/user/${user.id}`)}
      activeOpacity={0.8}
    >
      <Avatar uri={user.avatar_url} size="lg" />
      <Text style={styles.username} numberOfLines={1}>{user.username}</Text>
      <Text style={styles.fullName} numberOfLines={1}>{user.full_name}</Text>
      {user.mutual_count > 0 && (
        <Text style={styles.mutual}>
          {user.mutual_count} mutual {user.mutual_count === 1 ? 'friend' : 'friends'}
        </Text>
      )}
      <FollowButton
        isFollowing={isFollowing}
        loading={loading}
        onPress={toggleFollow}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    width: 160,
    marginRight: spacing.md,
  },
  username: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  fullName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mutual: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
});

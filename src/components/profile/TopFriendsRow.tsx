import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import type { Profile } from '@/types';

type Props = {
  friends: Pick<Profile, 'id' | 'username' | 'avatar_url'>[];
};

export function TopFriendsRow({ friends }: Props) {
  const router = useRouter();

  if (friends.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Top Friends</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {friends.map((friend) => (
          <TouchableOpacity
            key={friend.id}
            style={styles.item}
            onPress={() => router.push(`/(screens)/user/${friend.id}`)}
          >
            <Avatar uri={friend.avatar_url} size="md" />
            <Text style={styles.name} numberOfLines={1}>{friend.username}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  scroll: {
    gap: spacing.md,
  },
  item: {
    alignItems: 'center',
    width: 56,
  },
  name: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.text,
    marginTop: 2,
    textAlign: 'center',
  },
});

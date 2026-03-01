import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { colors, fontSize, typography, spacing } from '@/lib/theme';
import type { Profile } from '@/types';

type Props = {
  collaborators: Profile[];
  onPress?: () => void;
};

export function CollaboratorAvatars({ collaborators, onPress }: Props) {
  if (collaborators.length === 0) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={!onPress}>
      <View style={styles.avatars}>
        {collaborators.slice(0, 3).map((c, index) => (
          <View key={c.id} style={[styles.avatarWrapper, { marginLeft: index > 0 ? -8 : 0, zIndex: 3 - index }]}>
            <Avatar uri={c.avatar_url} size="sm" />
          </View>
        ))}
      </View>
      <Text style={styles.text}>
        with {collaborators.map((c) => c.username).join(', ')}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  avatars: {
    flexDirection: 'row',
    marginRight: spacing.xs,
  },
  avatarWrapper: {},
  text: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    flex: 1,
  },
});

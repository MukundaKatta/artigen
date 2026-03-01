import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  title?: string;
};

export function PostMusicBadge({ title }: Props) {
  return (
    <View style={styles.badge}>
      <Ionicons name="musical-note" size={12} color={colors.textLight} />
      {title ? (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textLight,
    maxWidth: 120,
  },
});

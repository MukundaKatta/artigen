import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  tags: string[];
  accentColor?: string;
};

export function InterestTags({ tags, accentColor }: Props) {
  if (!tags || tags.length === 0) return null;

  const tagColor = accentColor || colors.primary;

  return (
    <View style={styles.container}>
      {tags.map((tag) => (
        <View key={tag} style={[styles.tag, { backgroundColor: `${tagColor}15` }]}>
          <Text style={[styles.tagText, { color: tagColor }]}>{tag}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
  },
});

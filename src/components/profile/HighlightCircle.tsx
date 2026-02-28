import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { colors, fontSize, spacing, typography } from '@/lib/theme';
import type { HighlightWithStories } from '@/services/highlight.service';

type Props = {
  highlight: HighlightWithStories;
  onPress: () => void;
};

export function HighlightCircle({ highlight, onPress }: Props) {
  const coverUri = highlight.cover_url || highlight.items[0]?.media_url;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.ring}>
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {highlight.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: spacing.lg,
    width: 68,
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  placeholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.backgroundSecondary,
  },
  title: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

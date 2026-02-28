import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/lib/theme';

type Props = {
  avatarUrls: (string | null)[];
  size?: number;
};

export function GroupAvatar({ avatarUrls, size = 48 }: Props) {
  const urls = avatarUrls.slice(0, 4);
  const halfSize = size / 2 - 1;

  if (urls.length <= 1) {
    return (
      <Image
        source={{ uri: urls[0] || undefined }}
        style={[styles.single, { width: size, height: size, borderRadius: size / 2 }]}
        contentFit="cover"
      />
    );
  }

  return (
    <View style={[styles.grid, { width: size, height: size }]}>
      {urls.map((url, i) => (
        <Image
          key={i}
          source={{ uri: url || undefined }}
          style={[styles.gridItem, { width: halfSize, height: halfSize, borderRadius: halfSize / 2 }]}
          contentFit="cover"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  single: {
    backgroundColor: colors.border,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridItem: {
    backgroundColor: colors.border,
  },
});

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows, gradients } from '@/lib/theme';
import { AVATAR_SIZES } from '@/lib/constants';

type AvatarSize = keyof typeof AVATAR_SIZES;

type Props = {
  uri: string | null | undefined;
  size?: AvatarSize;
  onPress?: () => void;
  showStoryRing?: boolean;
  hasUnviewedStory?: boolean;
  online?: boolean;
};

export function Avatar({
  uri,
  size = 'md',
  onPress,
  showStoryRing = false,
  hasUnviewedStory = false,
  online = false,
}: Props) {
  const dimension = AVATAR_SIZES[size];
  const ringSize = dimension + 10;
  const gap = 2;

  const image = (
    <Image
      source={uri ? { uri } : require('../../../assets/images/default-avatar.png')}
      style={[
        styles.image,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
        },
      ]}
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={200}
      accessibilityLabel="User avatar"
    />
  );

  const content = (
    <View style={[shadows.sm, { borderRadius: ringSize / 2 }]}>
      {showStoryRing ? (
        hasUnviewedStory ? (
          <LinearGradient
            colors={gradients.storyRing}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.gradientRing,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
              },
            ]}
          >
            <View
              style={[
                styles.ringGap,
                {
                  width: ringSize - gap * 2,
                  height: ringSize - gap * 2,
                  borderRadius: (ringSize - gap * 2) / 2,
                },
              ]}
            >
              {image}
            </View>
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.viewedRing,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
              },
            ]}
          >
            <View
              style={[
                styles.ringGap,
                {
                  width: ringSize - gap * 2,
                  height: ringSize - gap * 2,
                  borderRadius: (ringSize - gap * 2) / 2,
                },
              ]}
            >
              {image}
            </View>
          </View>
        )
      ) : (
        image
      )}

      {online && (
        <View style={styles.onlineDot}>
          <View style={styles.onlineDotInner} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="View profile">
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.backgroundSecondary,
  },
  gradientRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewedRing: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  ringGap: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
});

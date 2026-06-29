import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors,
  borderRadius,
  shadows,
  gradients,
  spacing,
  fontSize,
  typography,
  hitSlop,
  palette,
} from '@/lib/theme';
import { AVATAR_SIZES } from '@/lib/constants';

type AvatarSize = keyof typeof AVATAR_SIZES;

type Props = {
  uri: string | null | undefined;
  name?: string;
  size?: AvatarSize;
  onPress?: () => void;
  showStoryRing?: boolean;
  hasUnviewedStory?: boolean;
  online?: boolean;
  /** Optional verified checkmark badge. */
  verified?: boolean;
};

// Deterministic colour pick for fallback initials so the same user
// always gets the same tint across the app.
const FALLBACK_COLOURS = [
  palette.blue500,
  palette.green500,
  palette.red500,
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
] as const;

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initialsFor(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function Avatar({
  uri,
  name,
  size = 'md',
  onPress,
  showStoryRing = false,
  hasUnviewedStory = false,
  online = false,
  verified = false,
}: Props) {
  const dimension = AVATAR_SIZES[size];
  const ringSize = dimension + 10;
  const gap = 2;

  const fallbackBg = FALLBACK_COLOURS[hashCode(name ?? '?') % FALLBACK_COLOURS.length];

  const image = uri ? (
    <Image
      source={{ uri }}
      style={[styles.image, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={200}
      accessibilityLabel={name ? `${name}'s avatar` : 'User avatar'}
      recyclingKey={uri}
    />
  ) : (
    <View
      style={[
        styles.fallback,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: fallbackBg,
        },
      ]}
      accessibilityLabel={name ? `${name}'s avatar` : 'User avatar'}
    >
      <Text
        style={[styles.fallbackText, { fontSize: Math.max(10, dimension * 0.42) }]}
        numberOfLines={1}
      >
        {initialsFor(name)}
      </Text>
    </View>
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
              { width: ringSize, height: ringSize, borderRadius: ringSize / 2 },
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
              { width: ringSize, height: ringSize, borderRadius: ringSize / 2 },
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

      {online ? (
        <View style={styles.onlineDot} accessibilityLabel="Online">
          <View style={styles.onlineDotInner} />
        </View>
      ) : null}

      {verified ? (
        <View style={styles.verifiedBadge} accessibilityLabel="Verified">
          <Text style={styles.verifiedTick}>✓</Text>
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={hitSlop.sm}
        accessibilityRole="button"
        accessibilityLabel={name ? `View ${name}'s profile` : 'View profile'}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// Avatar group — overlapping stack for "X liked your post" headers etc.
type GroupProps = {
  uris: Array<string | null | undefined>;
  names?: string[];
  size?: AvatarSize;
  max?: number;
};

export function AvatarGroup({ uris, names = [], size = 'sm', max = 3 }: GroupProps) {
  const visible = uris.slice(0, max);
  const overflow = Math.max(0, uris.length - visible.length);
  const dimension = AVATAR_SIZES[size];
  const overlap = Math.round(dimension * 0.35);

  return (
    <View style={styles.group}>
      {visible.map((u, i) => (
        <View
          key={`${u ?? 'fallback'}-${i}`}
          style={[
            styles.groupItem,
            i > 0 && { marginLeft: -overlap },
            { zIndex: visible.length - i },
          ]}
        >
          <Avatar uri={u} name={names[i]} size={size} />
        </View>
      ))}
      {overflow > 0 ? (
        <View
          style={[
            styles.overflowBubble,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              marginLeft: -overlap,
            },
          ]}
          accessibilityLabel={`${overflow} more`}
        >
          <Text style={styles.overflowText}>+{overflow}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.backgroundSecondary,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: colors.textLight,
    fontFamily: typography.semiBold,
    fontWeight: '600',
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
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedTick: {
    color: colors.textLight,
    fontSize: 8,
    fontWeight: '700',
    lineHeight: 10,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupItem: {
    borderWidth: 2,
    borderColor: colors.background,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  overflowBubble: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    paddingHorizontal: spacing.xxs,
  },
});

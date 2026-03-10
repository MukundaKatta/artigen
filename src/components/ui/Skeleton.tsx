import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing } from '@/lib/theme';

type SkeletonProps = {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
};

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export function Skeleton({ width, height, borderRadius = 4, style }: SkeletonProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [progress]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-200, 200]) }],
  }));

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <AnimatedGradient
        colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[StyleSheet.absoluteFill, { width: 200 }, shimmerStyle]}
      />
    </View>
  );
}

export function PostCardSkeleton() {
  return (
    <View style={skeletonStyles.postCard}>
      <View style={skeletonStyles.postHeader}>
        <Skeleton width={32} height={32} borderRadius={16} />
        <View style={{ marginLeft: spacing.sm, flex: 1 }}>
          <Skeleton width={120} height={12} borderRadius={4} />
          <Skeleton width={80} height={10} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
      </View>
      <Skeleton width="100%" height={375} borderRadius={0} />
      <View style={skeletonStyles.postActions}>
        <Skeleton width={100} height={14} borderRadius={4} />
      </View>
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
        <Skeleton width="70%" height={12} borderRadius={4} />
        <Skeleton width="50%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

export function UserRowSkeleton() {
  return (
    <View style={skeletonStyles.userRow}>
      <Skeleton width={44} height={44} borderRadius={22} />
      <View style={{ marginLeft: spacing.md, flex: 1 }}>
        <Skeleton width={120} height={13} borderRadius={4} />
        <Skeleton width={80} height={11} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

export function StoryBarSkeleton() {
  return (
    <View style={skeletonStyles.storyBar}>
      {[...Array(6)].map((_, i) => (
        <View key={i} style={skeletonStyles.storyItem}>
          <Skeleton width={56} height={56} borderRadius={28} />
          <Skeleton width={40} height={8} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
      ))}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  postCard: {
    backgroundColor: colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  postActions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  storyBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
});

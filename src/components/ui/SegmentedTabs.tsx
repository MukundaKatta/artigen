import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import {
  colors,
  spacing,
  fontSize,
  typography,
  borderRadius,
  animation,
  hitSlop,
} from '@/lib/theme';

type Tab<TValue extends string> = {
  value: TValue;
  label: string;
};

type Props<TValue extends string> = {
  value: TValue;
  onChange: (next: TValue) => void;
  tabs: Tab<TValue>[];
  /** Compact = smaller padding + smaller font. */
  compact?: boolean;
};

/**
 * Segmented control / pill tabs. Used for two- or three-way switches
 * (Following / For You / Trending, etc.). Animates the active pill
 * underneath rather than each label fading.
 */
export function SegmentedTabs<TValue extends string>({
  value,
  onChange,
  tabs,
  compact = false,
}: Props<TValue>) {
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.value === value),
  );
  const indexShared = useSharedValue(activeIndex);

  React.useEffect(() => {
    indexShared.value = withSpring(activeIndex, animation.spring.gentle);
  }, [activeIndex, indexShared]);

  const tabWidthPct = 100 / tabs.length;

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indexShared.value * 100 + '%' } as any],
  }));

  return (
    <View style={[styles.track, compact && styles.trackCompact]}>
      <Animated.View
        style={[styles.pill, { width: `${tabWidthPct}%`, height: '100%' }, pillStyle]}
      />
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <Pressable
            key={t.value}
            onPress={() => {
              if (active) return;
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              onChange(t.value);
            }}
            hitSlop={hitSlop.sm}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t.label}
            style={[styles.tab, compact && styles.tabCompact, { width: `${tabWidthPct}%` }]}
          >
            <Text
              style={[styles.label, compact && styles.labelCompact, active && styles.labelActive]}
              numberOfLines={1}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.full,
    padding: 3,
    alignSelf: 'flex-start',
  },
  trackCompact: {
    padding: 2,
  },
  pill: {
    position: 'absolute',
    top: 3,
    left: 3,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCompact: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  labelCompact: {
    fontSize: fontSize.xs,
  },
  labelActive: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
});

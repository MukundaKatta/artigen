import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, fontSize, spacing, typography } from '@/lib/theme';

type Tab = {
  key: string;
  label: string;
  icon?: React.ReactNode;
};

type Props = {
  tabs: Tab[];
  activeKey: string;
  onTabPress: (key: string) => void;
};

export function AnimatedTabBar({ tabs, activeKey, onTabPress }: Props) {
  const indicatorX = useSharedValue(0);
  const tabWidth = useSharedValue(0);

  const activeIndex = tabs.findIndex((t) => t.key === activeKey);

  useEffect(() => {
    if (tabWidth.value > 0) {
      indicatorX.value = withSpring(activeIndex * tabWidth.value, {
        damping: 20,
        stiffness: 300,
      });
    }
  }, [activeIndex, indicatorX, tabWidth]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width / tabs.length;
    tabWidth.value = w;
    indicatorX.value = activeIndex * w;
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: tabWidth.value,
  }));

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
          >
            {tab.icon ?? (
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
      <Animated.View style={[styles.indicator, indicatorStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    position: 'relative',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  tabText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.text,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: colors.text,
  },
});

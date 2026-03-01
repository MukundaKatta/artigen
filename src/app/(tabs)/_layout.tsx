import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs, Slot } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, shadows, typography } from '@/lib/theme';
import { LogoText } from '@/components/ui/LogoText';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { useResponsive } from '@/hooks/useResponsive';

function TabBarIcon({ name, focusedName, focused, color }: {
  name: string;
  focusedName: string;
  focused: boolean;
  color: string;
}) {
  const scale = useSharedValue(focused ? 1 : 1);
  const dotScale = useSharedValue(focused ? 1 : 0);

  React.useEffect(() => {
    dotScale.value = withSpring(focused ? 1 : 0, { damping: 15, stiffness: 300 });
  }, [focused, dotScale]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
    opacity: dotScale.value,
  }));

  return (
    <View style={tabIconStyles.container}>
      <Ionicons
        name={(focused ? focusedName : name) as any}
        size={name === 'add-circle-outline' ? 30 : 26}
        color={color}
      />
      <Animated.View style={[tabIconStyles.dot, dotStyle]} />
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
});

function TabBarBackground() {
  if (Platform.OS === 'web') {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.95)' }]} />;
  }
  return (
    <BlurView
      intensity={80}
      tint="light"
      style={StyleSheet.absoluteFill}
    />
  );
}

export default function TabLayout() {
  const { isMobile } = useResponsive();

  // Desktop/tablet: use sidebar navigation instead of bottom tabs
  if (Platform.OS === 'web' && !isMobile) {
    return (
      <DesktopLayout>
        <Slot />
      </DesktopLayout>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: false,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          ...shadows.tabBar,
        },
        headerStyle: {
          backgroundColor: colors.background,
          ...shadows.sm,
        },
        headerTitleStyle: {
          color: colors.text,
          fontFamily: typography.semiBold,
        },
      }}
      screenListeners={{
        tabPress: () => {
          if (Platform.OS !== 'web') {
            Haptics.selectionAsync();
          }
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => <LogoText size="sm" />,
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="home-outline" focusedName="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="search-outline" focusedName="search" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="add-circle-outline" focusedName="add-circle-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          title: 'Reels',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="play-circle-outline" focusedName="play-circle" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="person-circle-outline" focusedName="person-circle" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

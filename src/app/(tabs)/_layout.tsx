import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs, Slot } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { colors, shadows, typography } from '@/lib/theme';
import { LogoText } from '@/components/ui/LogoText';
import { CreditBadge } from '@/components/ui/CreditBadge';
import { FeatureErrorBoundary } from '@/components/ui/ErrorBoundary';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { claimDailyLogin } from '@/services/engagement-rewards.service';

// Context for scroll-to-top on tab re-tap
type ScrollToTopFn = () => void;
const ScrollToTopContext = React.createContext<{
  register: (tab: string, fn: ScrollToTopFn) => void;
  unregister: (tab: string) => void;
  trigger: (tab: string) => void;
}>({
  register: () => {},
  unregister: () => {},
  trigger: () => {},
});

export function useScrollToTopOnTabPress(tabName: string, scrollFn: ScrollToTopFn) {
  const { register, unregister } = useContext(ScrollToTopContext);
  React.useEffect(() => {
    register(tabName, scrollFn);
    return () => unregister(tabName);
  }, [tabName, scrollFn, register, unregister]);
}

function TabBarIcon({ name, focusedName, focused, color }: {
  name: string;
  focusedName: string;
  focused: boolean;
  color: string;
}) {
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

function TabBarBackground({ isDark }: { isDark: boolean }) {
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)' },
        ]}
      />
    );
  }
  return (
    <BlurView
      intensity={80}
      tint={isDark ? 'dark' : 'light'}
      style={StyleSheet.absoluteFill}
    />
  );
}

export default function TabLayout() {
  const { isMobile } = useResponsive();
  const { isDark, themeColors } = useTheme();
  const { user } = useAuth();

  // Claim daily login reward (fire-and-forget on mount)
  const dailyLoginClaimed = useRef(false);
  useEffect(() => {
    if (user && !dailyLoginClaimed.current) {
      dailyLoginClaimed.current = true;
      claimDailyLogin().catch((err) => console.warn('Daily login reward claim failed:', err));
    }
  }, [user]);

  // Scroll-to-top registry
  const registryRef = useRef<Record<string, ScrollToTopFn>>({});
  const lastTapRef = useRef<Record<string, number>>({});
  const register = useCallback((tab: string, fn: ScrollToTopFn) => { registryRef.current[tab] = fn; }, []);
  const unregister = useCallback((tab: string) => { delete registryRef.current[tab]; }, []);
  const trigger = useCallback((tab: string) => { registryRef.current[tab]?.(); }, []);
  const scrollToTopValue = React.useMemo(() => ({ register, unregister, trigger }), [register, unregister, trigger]);

  // Desktop/tablet: use sidebar navigation instead of bottom tabs
  if (Platform.OS === 'web' && !isMobile) {
    return (
      <FeatureErrorBoundary fallbackTitle="Something went wrong">
        <DesktopLayout>
          <Slot />
        </DesktopLayout>
      </FeatureErrorBoundary>
    );
  }

  return (
    <FeatureErrorBoundary fallbackTitle="Something went wrong">
    <ScrollToTopContext.Provider value={scrollToTopValue}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.text,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarShowLabel: false,
        tabBarBackground: () => <TabBarBackground isDark={isDark} />,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          ...shadows.tabBar,
          ...(Platform.OS === 'web' ? {
            paddingBottom: 'env(safe-area-inset-bottom, 0px)' as any,
          } : {}),
        },
        headerStyle: {
          backgroundColor: themeColors.background,
          ...shadows.sm,
        },
        headerTitleStyle: {
          color: themeColors.text,
          fontFamily: typography.semiBold,
        },
      }}
      screenListeners={{
        tabPress: (e) => {
          if (Platform.OS !== 'web') {
            Haptics.selectionAsync();
          }
          // Scroll to top if user taps the already-active tab
          const target = e.target;
          if (target) {
            const tabName = target.split('-')[0];
            const now = Date.now();
            const lastTap = lastTapRef.current[tabName] || 0;
            if (now - lastTap < 500) {
              trigger(tabName);
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            lastTapRef.current[tabName] = now;
          }
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => <LogoText size="sm" />,
          headerRight: () => <CreditBadge />,
          headerRightContainerStyle: { paddingRight: 12 },
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
    </ScrollToTopContext.Provider>
    </FeatureErrorBoundary>
  );
}

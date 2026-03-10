import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { LogoText } from '@/components/ui/LogoText';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/lib/constants';

type NavItem = {
  label: string;
  icon: string;
  activeIcon: string;
  path: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: 'home-outline', activeIcon: 'home', path: '/(tabs)' },
  { label: 'Search', icon: 'search-outline', activeIcon: 'search', path: '/(tabs)/search' },
  { label: 'Reels', icon: 'play-circle-outline', activeIcon: 'play-circle', path: '/(tabs)/reels' },
  { label: 'Messages', icon: 'chatbubble-outline', activeIcon: 'chatbubble', path: '/(messages)' },
  { label: 'Notifications', icon: 'heart-outline', activeIcon: 'heart', path: '/notifications' },
  { label: 'Create', icon: 'add-circle-outline', activeIcon: 'add-circle', path: '/(tabs)/create' },
  { label: 'Profile', icon: 'person-circle-outline', activeIcon: 'person-circle', path: '/(tabs)/profile' },
];

type Props = {
  collapsed?: boolean;
};

export function DesktopSidebar({ collapsed = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  function isActive(item: NavItem) {
    if (item.path === '/(tabs)') return pathname === '/' || pathname === '/(tabs)';
    return pathname.startsWith(item.path);
  }

  return (
    <View style={[styles.container, { width: sidebarWidth }]}>
      <View style={styles.logoContainer}>
        {collapsed ? (
          <Ionicons name="sparkles" size={24} color={colors.primary} />
        ) : (
          <LogoText size="sm" />
        )}
      </View>

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <AnimatedPressable
              key={item.label}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => router.push(item.path as any)}
              scaleValue={0.97}
              {...(Platform.OS === 'web' ? {
                // @ts-ignore - web hover styles
                onMouseEnter: (e: any) => { e.currentTarget.style.backgroundColor = colors.backgroundSecondary; },
                onMouseLeave: (e: any) => { e.currentTarget.style.backgroundColor = active ? 'transparent' : 'transparent'; },
              } : {})}
            >
              <Ionicons
                name={(active ? item.activeIcon : item.icon) as any}
                size={26}
                color={colors.text}
              />
              {!collapsed && (
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                  {item.label}
                </Text>
              )}
            </AnimatedPressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <AnimatedPressable
          style={styles.navItem}
          onPress={() => router.push('/(screens)/settings' as any)}
          scaleValue={0.97}
        >
          <Ionicons name="menu-outline" size={26} color={colors.text} />
          {!collapsed && <Text style={styles.navLabel}>More</Text>}
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%' as any,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.background,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  logoContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  nav: {
    flex: 1,
    gap: spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.lg,
  },
  navItemActive: {
    backgroundColor: 'transparent',
  },
  navLabel: {
    fontSize: fontSize.lg,
    fontFamily: typography.regular,
    color: colors.text,
  },
  navLabelActive: {
    fontFamily: typography.bold,
    fontWeight: '700',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
});

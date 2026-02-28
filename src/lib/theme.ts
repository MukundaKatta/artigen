import { Platform } from 'react-native';

// Theme colors type — shared keys between light and dark
export type ThemeColors = {
  primary: string;
  primaryDark: string;
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  textLight: string;
  border: string;
  like: string;
  success: string;
  warning: string;
  error: string;
  link: string;
  notificationUnread: string;
  storyGradient: readonly string[];
  overlay: string;
};

export const lightColors: ThemeColors = {
  primary: '#0095F6',
  primaryDark: '#0074CC',
  background: '#FFFFFF',
  backgroundSecondary: '#FAFAFA',
  text: '#262626',
  textSecondary: '#8E8E8E',
  textLight: '#FFFFFF',
  border: '#DBDBDB',
  like: '#ED4956',
  success: '#58C322',
  warning: '#FFBB00',
  error: '#ED4956',
  link: '#00376B',
  notificationUnread: 'rgba(0, 149, 246, 0.08)',
  storyGradient: ['#F58529', '#DD2A7B', '#8134AF', '#515BD4'],
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkColors: ThemeColors = {
  primary: '#0095F6',
  primaryDark: '#0074CC',
  background: '#000000',
  backgroundSecondary: '#121212',
  text: '#FAFAFA',
  textSecondary: '#A8A8A8',
  textLight: '#FFFFFF',
  border: '#363636',
  like: '#ED4956',
  success: '#58C322',
  warning: '#FFBB00',
  error: '#ED4956',
  link: '#E0F1FF',
  notificationUnread: 'rgba(0, 149, 246, 0.15)',
  storyGradient: ['#F58529', '#DD2A7B', '#8134AF', '#515BD4'],
  overlay: 'rgba(0, 0, 0, 0.7)',
};

// Backwards-compatible export — points to light colors plus legacy keys
export const colors = {
  ...lightColors,
  // Legacy keys still used across the codebase
  backgroundDark: '#000000',
  backgroundDarkSecondary: '#121212',
  borderDark: '#363636',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  logo: Platform.OS === 'ios' ? 'Georgia' : 'serif',
} as const;

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    android: { elevation: 1 },
    default: {},
  }) as Record<string, any>,
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: { elevation: 3 },
    default: {},
  }) as Record<string, any>,
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: { elevation: 6 },
    default: {},
  }) as Record<string, any>,
  tabBar: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 8 },
    default: {},
  }) as Record<string, any>,
} as const;

export const gradients = {
  storyRing: ['#F58529', '#DD2A7B', '#8134AF', '#515BD4'] as [string, string, ...string[]],
  primaryButton: ['#0095F6', '#1877F2'] as [string, string, ...string[]],
  shimmer: ['#EBEBEB', '#F5F5F5', '#EBEBEB'] as [string, string, ...string[]],
};

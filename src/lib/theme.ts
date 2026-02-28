import { Platform } from 'react-native';

export const colors = {
  // Primary brand colors
  primary: '#0095F6',
  primaryDark: '#0074CC',

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#FAFAFA',
  backgroundDark: '#000000',
  backgroundDarkSecondary: '#121212',

  // Text
  text: '#262626',
  textSecondary: '#8E8E8E',
  textLight: '#FFFFFF',

  // Borders
  border: '#DBDBDB',
  borderDark: '#363636',

  // Actions
  like: '#ED4956',
  success: '#58C322',
  warning: '#FFBB00',
  error: '#ED4956',

  // Semantic
  link: '#00376B',
  notificationUnread: 'rgba(0, 149, 246, 0.08)',

  // Story gradient
  storyGradient: ['#F58529', '#DD2A7B', '#8134AF', '#515BD4'] as const,

  // Transparent
  overlay: 'rgba(0, 0, 0, 0.5)',
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

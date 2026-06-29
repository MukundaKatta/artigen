import { Platform } from 'react-native';

// Theme colors type — shared keys between light and dark
export type ThemeColors = {
  primary: string;
  primaryDark: string;
  accent: string;
  accentDark: string;
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
  accent: '#8B5CF6',
  accentDark: '#6D28D9',
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
  accent: '#A78BFA',
  accentDark: '#7C3AED',
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
  surface: '#F5F5F5',
} as const;

export const providerColors = {
  free: '#10B981',
  openai: '#10A37F',
  gemini: '#4285F4',
  anthropic: '#C9784F',
  stability: '#5B6CFF',
  replicate: '#0F1419',
} as const;

export const platformColors = {
  photo: '#E1306C',
  twitter: '#1DA1F2',
  facebook: '#1877F2',
  pinterest: '#E60023',
  tiktok: '#010101',
  threads: '#000000',
  bluesky: '#0085FF',
  reddit: '#FF4500',
  linkedin: '#0A66C2',
  discord: '#5865F2',
} as const;

export const stickerColors = {
  poll: '#F59E0B',
  question: '#EC4899',
  emojiSlider: '#F97316',
  countdown: '#EF4444',
  link: '#3B82F6',
  music: '#10B981',
  location: '#06B6D4',
  mention: '#8B5CF6',
} as const;

/**
 * Accent / brand-feature tokens used by feature surfaces (streaks,
 * subscribers, workflow steps, etc.). Distinct from semantic `warning`
 * because they signal feature identity rather than a transient state.
 */
export const accentColors = {
  amber: '#F59E0B',
  gold: '#FFD700',
  emerald: '#10B981',
  pink: '#EC4899',
  cyan: '#06B6D4',
  indigo: '#6366F1',
  rose: '#F43F5E',
  lime: '#84CC16',
  teal: '#14B8A6',
  violet: '#8B5CF6',
} as const;

// Extended brand palette (50→950 ramp) for fine-grained tinting.
// Use sparingly — prefer semantic tokens above. Useful for charts,
// avatar fallbacks, and per-user identity colors.
export const palette = {
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue300: '#93C5FD',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',
  blue800: '#1E40AF',
  blue900: '#1E3A8A',
  blue950: '#172554',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  slate950: '#020617',
  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red200: '#FECACA',
  red300: '#FCA5A5',
  red400: '#F87171',
  red500: '#EF4444',
  red600: '#DC2626',
  red700: '#B91C1C',
  red800: '#991B1B',
  red900: '#7F1D1D',
  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green200: '#BBF7D0',
  green300: '#86EFAC',
  green400: '#4ADE80',
  green500: '#22C55E',
  green600: '#16A34A',
  green700: '#15803D',
  green800: '#166534',
  green900: '#14532D',
} as const;

// Semantic feedback hues used inline by Toast, Banner, etc. Both
// foreground (text/icon) and a 12%-opacity background pair.
export const feedback = {
  info: { fg: palette.blue700, bg: palette.blue50 },
  success: { fg: palette.green700, bg: palette.green50 },
  warning: { fg: '#92400E', bg: '#FEF3C7' },
  error: { fg: palette.red700, bg: palette.red50 },
  neutral: { fg: palette.slate700, bg: palette.slate50 },
} as const;

export function withOpacity(color: string, opacity: number): string {
  if (!color.startsWith('#')) return color;

  const hex = color.slice(1);
  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((value) => value + value)
          .join('')
      : hex.slice(0, 6);
  const value = Number.parseInt(normalized, 16);

  if (Number.isNaN(value)) return color;

  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

// Spacing — 4px base scale (8-pt grid friendly with half-step at 4).
export const spacing = {
  zero: 0,
  xxxs: 2,
  xxs: 4,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
  '8xl': 96,
} as const;

export const fontSize = {
  '2xs': 9,
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  '4xl': 34,
  '5xl': 44,
  display: 56,
  hero: 72,
} as const;

export const lineHeight = {
  none: 1,
  tight: 1.15,
  snug: 1.3,
  normal: 1.4,
  relaxed: 1.55,
  loose: 1.75,
} as const;

export const letterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
} as const;

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 28,
  full: 9999,
} as const;

export const typography = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  logo: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'ui-monospace, SFMono-Regular, monospace',
  }),
} as const;

// Per-role typography presets — keep style definitions co-located so
// new screens don't reinvent the wheel.
export const textStyles = {
  display: {
    fontSize: fontSize.display,
    lineHeight: fontSize.display * lineHeight.tight,
    fontFamily: typography.bold,
    letterSpacing: letterSpacing.tight,
  },
  h1: {
    fontSize: fontSize['4xl'],
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    fontFamily: typography.bold,
  },
  h2: {
    fontSize: fontSize.xxxl,
    lineHeight: fontSize.xxxl * lineHeight.snug,
    fontFamily: typography.bold,
  },
  h3: {
    fontSize: fontSize.xxl,
    lineHeight: fontSize.xxl * lineHeight.snug,
    fontFamily: typography.semiBold,
  },
  body: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.normal,
    fontFamily: typography.regular,
  },
  bodySm: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.normal,
    fontFamily: typography.regular,
  },
  caption: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    fontFamily: typography.regular,
  },
  label: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.snug,
    fontFamily: typography.semiBold,
    letterSpacing: letterSpacing.wide,
  },
  overline: {
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.snug,
    fontFamily: typography.semiBold,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase' as const,
  },
} as const;

export const shadows = {
  none: {} as Record<string, any>,
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
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 28,
    },
    android: { elevation: 12 },
    default: {},
  }) as Record<string, any>,
  '2xl': Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.24,
      shadowRadius: 36,
    },
    android: { elevation: 18 },
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
  // Branded glow used for hero CTAs in dark mode
  glow: Platform.select({
    ios: {
      shadowColor: '#0095F6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 24,
    },
    android: { elevation: 8 },
    default: {},
  }) as Record<string, any>,
} as const;

export const gradients = {
  storyRing: ['#F58529', '#DD2A7B', '#8134AF', '#515BD4'] as [string, string, ...string[]],
  primaryButton: ['#0095F6', '#1877F2'] as [string, string, ...string[]],
  shimmer: ['#EBEBEB', '#F5F5F5', '#EBEBEB'] as [string, string, ...string[]],
  shimmerDark: ['#1F1F1F', '#2A2A2A', '#1F1F1F'] as [string, string, ...string[]],
  ai: ['#8B5CF6', '#6D28D9', '#4C1D95'] as [string, string, ...string[]],
  sunset: ['#FF6B6B', '#FECA57', '#FF9F43'] as [string, string, ...string[]],
  ocean: ['#0093E9', '#80D0C7'] as [string, string, ...string[]],
  neon: ['#FF00C8', '#00E0FF'] as [string, string, ...string[]],
  emerald: ['#10B981', '#059669'] as [string, string, ...string[]],
  rose: ['#F43F5E', '#FB7185'] as [string, string, ...string[]],
  // Subtle hero backdrop for the marketing landing
  heroBackdrop: ['#FAFAFA', '#FFFFFF', '#F5F8FF'] as [string, string, ...string[]],
};

export const animation = {
  duration: {
    instant: 80,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 750,
    crawl: 1000,
    shimmer: 1200,
  },
  spring: {
    button: { damping: 6, stiffness: 300 },
    bouncy: { damping: 4, stiffness: 300 },
    gentle: { damping: 20, stiffness: 300 },
    stiff: { damping: 15, stiffness: 400 },
    floppy: { damping: 30, stiffness: 200 },
    snappy: { damping: 12, stiffness: 500 },
  },
  stagger: {
    delay: 60,
    maxItems: 8,
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    snap: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;

// Opacity scale for interaction states.
export const opacity = {
  disabled: 0.4,
  hover: 0.85,
  pressed: 0.7,
  focus: 1,
  veil: 0.6,
} as const;

// z-index ladder — never use ad-hoc numbers.
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  banner: 300,
  overlay: 400,
  modal: 500,
  popover: 600,
  toast: 700,
  tooltip: 800,
  max: 9999,
} as const;

// Common touch-target hitSlop expansions.
export const hitSlop = {
  sm: { top: 4, bottom: 4, left: 4, right: 4 },
  md: { top: 8, bottom: 8, left: 8, right: 8 },
  lg: { top: 12, bottom: 12, left: 12, right: 12 },
} as const;

// Responsive breakpoints (mirrors lib/constants.BREAKPOINTS but typed
// alongside the rest of the design system).
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

// Outline tokens for keyboard / focus rings.
export const focusRing = {
  width: 2,
  offset: 2,
  color: '#0095F6',
  colorDark: '#60A5FA',
} as const;

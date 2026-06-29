import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '@/lib/theme';

type Elevation = 'flat' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'glow';
type Padding = keyof typeof spacing | 'none';
type Radius = keyof typeof borderRadius;

type Props = {
  elevation?: Elevation;
  padding?: Padding;
  radius?: Radius;
  /** Use the secondary background instead of the base. */
  tinted?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const SHADOW_MAP: Record<Elevation, ViewStyle | undefined> = {
  flat: undefined,
  sm: shadows.sm,
  md: shadows.md,
  lg: shadows.lg,
  xl: shadows.xl,
  '2xl': shadows['2xl'],
  glow: shadows.glow,
};

/**
 * Generic raised surface. Use as the foundation for non-press cards
 * (modals, banners, panels). For pressable cards use `<Card>` instead.
 */
export function Surface({
  elevation = 'sm',
  padding = 'lg',
  radius = 'xl',
  tinted = false,
  style,
  children,
}: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: tinted ? colors.backgroundSecondary : colors.background,
          padding: padding === 'none' ? 0 : (spacing[padding] as number),
          borderRadius: borderRadius[radius] as number,
        },
        SHADOW_MAP[elevation],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const _styles = StyleSheet.create({});

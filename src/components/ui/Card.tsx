import React from 'react';
import { View, ViewStyle, StyleProp, Pressable, StyleSheet } from 'react-native';
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  opacity as opacityScale,
  hitSlop,
} from '@/lib/theme';

type CardVariant = 'flat' | 'outlined' | 'elevated' | 'tinted';

type Props = {
  variant?: CardVariant;
  padding?: keyof typeof spacing;
  radius?: keyof typeof borderRadius;
  /** Make the entire card a tap target. */
  onPress?: () => void;
  /** Accessibility label when onPress is set. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function Card({
  variant = 'flat',
  padding = 'lg',
  radius = 'xl',
  onPress,
  accessibilityLabel,
  style,
  children,
}: Props) {
  const containerStyle = [
    styles.base,
    styles[variant],
    {
      padding: spacing[padding] as number,
      borderRadius: borderRadius[radius] as number,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={hitSlop.sm}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [containerStyle, pressed && { opacity: opacityScale.pressed }]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.background,
  },
  flat: {},
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    ...shadows.md,
  },
  tinted: {
    backgroundColor: colors.backgroundSecondary,
  },
});

import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, hitSlop, opacity as opacityScale, spacing } from '@/lib/theme';

type IconButtonSize = 'sm' | 'md' | 'lg';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: IconButtonSize;
  variant?: 'plain' | 'filled' | 'outlined' | 'tinted';
  color?: string;
  disabled?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

const DIM: Record<IconButtonSize, { box: number; icon: number }> = {
  sm: { box: 32, icon: 16 },
  md: { box: 40, icon: 20 },
  lg: { box: 48, icon: 24 },
};

export function IconButton({
  icon,
  onPress,
  size = 'md',
  variant = 'plain',
  color,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: Props) {
  const dims = DIM[size];
  const tint = color ?? colors.text;
  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      hitSlop={hitSlop.md}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        {
          width: dims.box,
          height: dims.box,
          borderRadius: dims.box / 2,
        },
        disabled && { opacity: opacityScale.disabled },
        pressed && { opacity: opacityScale.pressed },
        style,
      ]}
    >
      <Ionicons name={icon} size={dims.icon} color={tint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plain: {
    backgroundColor: 'transparent',
  },
  filled: {
    backgroundColor: colors.primary,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tinted: {
    backgroundColor: colors.backgroundSecondary,
  },
});

import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, fontSize, borderRadius, spacing, typography, shadows, gradients } from '@/lib/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  size = 'md',
}: Props) {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const inner = loading ? (
    <ActivityIndicator
      color={variant === 'primary' ? colors.textLight : colors.primary}
      size="small"
    />
  ) : (
    <Text
      style={[
        styles.buttonText,
        styles[`${variant}Text`],
        styles[`size_${size}_text`],
        textStyle,
      ]}
    >
      {title}
    </Text>
  );

  if (variant === 'primary' && !isDisabled) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        disabled={isDisabled}
        style={[styles[`size_${size}`], shadows.md as ViewStyle, style] as ViewStyle[]}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
      >
        <LinearGradient
          colors={gradients.primaryButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, styles[`size_${size}`]]}
        >
          {inner}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        variant === 'primary' && isDisabled && styles.primaryDisabled,
        style,
      ] as ViewStyle[]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {inner}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  primaryDisabled: {
    backgroundColor: colors.primary,
    opacity: 0.5,
  },
  secondary: {
    backgroundColor: colors.backgroundSecondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    backgroundColor: 'transparent',
  },
  size_sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 36,
    borderRadius: borderRadius.md,
  },
  size_md: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    borderRadius: borderRadius.md,
  },
  size_lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
    borderRadius: borderRadius.md,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: typography.semiBold,
  },
  primaryText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '600',
  },
  outlineText: {
    color: colors.text,
    fontWeight: '600',
  },
  textText: {
    color: colors.primary,
    fontWeight: '600',
  },
  size_sm_text: {
    fontSize: fontSize.sm,
  },
  size_md_text: {
    fontSize: fontSize.md,
  },
  size_lg_text: {
    fontSize: fontSize.lg,
  },
});

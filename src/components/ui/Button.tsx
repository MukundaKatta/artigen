import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import {
  colors,
  fontSize,
  borderRadius,
  spacing,
  typography,
  shadows,
  gradients,
  opacity as opacityScale,
  letterSpacing,
  hitSlop,
} from '@/lib/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'ghost' | 'destructive';

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  style,
  textStyle,
  size = 'md',
  accessibilityLabel,
  accessibilityHint,
}: Props) {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (Platform.OS !== 'web' && !isDisabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const labelColor =
    variant === 'primary' || variant === 'destructive'
      ? colors.textLight
      : variant === 'text'
        ? colors.primary
        : variant === 'ghost'
          ? colors.textSecondary
          : colors.text;

  const inner = (
    <View style={styles.row}>
      {iconLeft ? <View style={styles.icon}>{iconLeft}</View> : null}
      {loading ? (
        <ActivityIndicator color={labelColor} size="small" />
      ) : (
        <Text
          style={[
            styles.buttonText,
            styles[`${variant}Text`],
            styles[`size_${size}_text`],
            textStyle,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      )}
      {iconRight ? <View style={styles.icon}>{iconRight}</View> : null}
    </View>
  );

  // Gradient primary — only when not disabled, so the disabled state
  // can reuse the flat-fill branch below.
  if (variant === 'primary' && !isDisabled) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        disabled={isDisabled}
        hitSlop={hitSlop.sm}
        style={
          [
            styles[`size_${size}`],
            shadows.md as ViewStyle,
            fullWidth && styles.fullWidth,
            style,
          ] as ViewStyle[]
        }
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityHint={accessibilityHint}
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
      hitSlop={hitSlop.sm}
      style={
        [
          styles.base,
          styles[variant],
          styles[`size_${size}`],
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          variant === 'primary' && isDisabled && styles.primaryDisabled,
          style,
        ] as ViewStyle[]
      }
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {inner}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
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
    opacity: opacityScale.disabled,
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
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
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
    opacity: opacityScale.disabled,
  },
  buttonText: {
    fontFamily: typography.semiBold,
    letterSpacing: letterSpacing.wide,
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
  ghostText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  destructiveText: {
    color: colors.textLight,
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

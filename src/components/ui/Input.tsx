import React, { forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { colors, fontSize, borderRadius, spacing, typography } from '@/lib/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
};

const AnimatedView = Animated.View;

export const Input = forwardRef<TextInput, Props>(
  ({ label, error, containerStyle, style, onFocus, onBlur, ...props }, ref) => {
    const focusAnim = useSharedValue(0);

    const borderStyle = useAnimatedStyle(() => {
      const borderColor = interpolateColor(
        focusAnim.value,
        [0, 1],
        [error ? colors.error : colors.border, error ? colors.error : colors.primary]
      );
      return { borderColor };
    });

    const handleFocus = (e: any) => {
      focusAnim.value = withTiming(1, { duration: 200 });
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      focusAnim.value = withTiming(0, { duration: 200 });
      onBlur?.(e);
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <AnimatedView style={[styles.inputWrapper, borderStyle, error && styles.inputErrorBg]}>
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </AnimatedView>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
    fontFamily: typography.medium,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
    color: colors.text,
    fontFamily: typography.regular,
  },
  inputErrorBg: {
    backgroundColor: 'rgba(237, 73, 86, 0.04)',
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
    fontFamily: typography.regular,
  },
});

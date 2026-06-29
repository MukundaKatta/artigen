import React, { forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import {
  colors,
  fontSize,
  borderRadius,
  spacing,
  typography,
  hitSlop,
  lineHeight,
} from '@/lib/theme';

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  onIconRightPress?: () => void;
  clearable?: boolean;
  showCount?: boolean;
  containerStyle?: ViewStyle;
};

const AnimatedView = Animated.View;

export const Input = forwardRef<TextInput, Props>(
  (
    {
      label,
      hint,
      error,
      iconLeft,
      iconRight,
      onIconRightPress,
      clearable,
      showCount,
      containerStyle,
      style,
      onFocus,
      onBlur,
      onChangeText,
      value,
      maxLength,
      ...props
    },
    ref,
  ) => {
    const focusAnim = useSharedValue(0);
    const shakeAnim = useSharedValue(0);
    const prevError = React.useRef<string | undefined>();

    // Shake when a new error appears
    React.useEffect(() => {
      if (error && error !== prevError.current) {
        shakeAnim.value = withSequence(
          withTiming(8, { duration: 50 }),
          withTiming(-8, { duration: 50 }),
          withTiming(6, { duration: 50 }),
          withTiming(-6, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        );
      }
      prevError.current = error;
    }, [error, shakeAnim]);

    const borderStyle = useAnimatedStyle(() => {
      const borderColor = interpolateColor(
        focusAnim.value,
        [0, 1],
        [error ? colors.error : colors.border, error ? colors.error : colors.primary],
      );
      return { borderColor, transform: [{ translateX: shakeAnim.value }] };
    });

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      focusAnim.value = withTiming(1, { duration: 200 });
      onFocus?.(e);
    };

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      focusAnim.value = withTiming(0, { duration: 200 });
      onBlur?.(e);
    };

    const showClear = clearable && !!value && !props.editable === false;
    const count = value?.length ?? 0;
    const overLimit = maxLength != null && count > maxLength;

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <AnimatedView style={[styles.inputWrapper, borderStyle, error && styles.inputErrorBg]}>
          {iconLeft ? (
            <View style={styles.iconLeft}>
              <Ionicons name={iconLeft} size={18} color={colors.textSecondary} />
            </View>
          ) : null}
          <TextInput
            ref={ref}
            style={[styles.input, !!iconLeft && styles.inputWithLeftIcon, style]}
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeText={onChangeText}
            value={value}
            maxLength={maxLength}
            accessibilityLabel={label || props.placeholder}
            accessibilityState={{ disabled: props.editable === false }}
            {...props}
          />
          {showClear ? (
            <Pressable
              onPress={() => onChangeText?.('')}
              hitSlop={hitSlop.md}
              accessibilityRole="button"
              accessibilityLabel="Clear input"
              style={styles.trailingPressable}
            >
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          ) : iconRight ? (
            <Pressable
              onPress={onIconRightPress}
              hitSlop={hitSlop.md}
              disabled={!onIconRightPress}
              accessibilityRole={onIconRightPress ? 'button' : undefined}
              style={styles.trailingPressable}
            >
              <Ionicons name={iconRight} size={18} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </AnimatedView>
        <View style={styles.footerRow}>
          <View style={styles.footerLeft}>
            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : hint ? (
              <Text style={styles.hint}>{hint}</Text>
            ) : null}
          </View>
          {showCount && maxLength != null ? (
            <Text
              style={[styles.count, overLimit && styles.countOver]}
              accessibilityLabel={`${count} of ${maxLength} characters used`}
            >
              {count}/{maxLength}
            </Text>
          ) : null}
        </View>
      </View>
    );
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
  },
  iconLeft: {
    paddingLeft: spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
    color: colors.text,
    fontFamily: typography.regular,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.sm,
  },
  trailingPressable: {
    paddingHorizontal: spacing.md,
  },
  inputErrorBg: {
    backgroundColor: 'rgba(237, 73, 86, 0.04)',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  footerLeft: {
    flex: 1,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.regular,
    lineHeight: fontSize.xs * lineHeight.normal,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.error,
    fontFamily: typography.regular,
    lineHeight: fontSize.xs * lineHeight.normal,
  },
  count: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.regular,
    marginLeft: spacing.sm,
  },
  countOver: {
    color: colors.error,
    fontFamily: typography.semiBold,
  },
});

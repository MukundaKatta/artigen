import React from 'react';
import { Pressable, StyleSheet, View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import {
  colors,
  borderRadius,
  fontSize,
  typography,
  spacing,
  hitSlop,
  animation,
  opacity as opacityScale,
} from '@/lib/theme';

type Props = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function Checkbox({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  accessibilityLabel,
}: Props) {
  const progress = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, animation.spring.snappy);
  }, [value, progress]);

  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onValueChange(!value);
  };

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.85 + progress.value * 0.15 }],
  }));
  const tickStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      hitSlop={hitSlop.md}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.row, disabled && { opacity: opacityScale.disabled }]}
    >
      <Animated.View style={[styles.box, value ? styles.boxOn : styles.boxOff, boxStyle]}>
        <Animated.View style={tickStyle}>
          <Ionicons name="checkmark" size={14} color={colors.textLight} />
        </Animated.View>
      </Animated.View>
      {label || description ? (
        <View style={styles.labels}>
          {label ? <Text style={styles.label}>{label}</Text> : null}
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOff: {
    borderWidth: 2,
    borderColor: colors.border,
  },
  boxOn: {
    backgroundColor: colors.primary,
  },
  labels: {
    flex: 1,
  },
  label: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  description: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

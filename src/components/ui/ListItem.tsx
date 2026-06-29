import React from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  colors,
  spacing,
  fontSize,
  typography,
  lineHeight,
  hitSlop,
  opacity as opacityScale,
} from '@/lib/theme';

type Props = {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  /** Custom left slot — overrides leftIcon. */
  leftSlot?: React.ReactNode;
  /** Custom right slot (Switch, Badge, etc.) — overrides chevron. */
  rightSlot?: React.ReactNode;
  /** Default chevron on the right when onPress is provided. */
  chevron?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  /** Hairline divider below (visual list grouping). */
  divided?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ListItem({
  title,
  subtitle,
  leftIcon,
  leftIconColor,
  leftSlot,
  rightSlot,
  chevron = true,
  onPress,
  disabled = false,
  destructive = false,
  divided = false,
  style,
}: Props) {
  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onPress?.();
  };

  const titleColor = destructive ? colors.error : disabled ? colors.textSecondary : colors.text;

  const inner = (
    <View
      style={[
        styles.row,
        divided && styles.divided,
        disabled && { opacity: opacityScale.disabled },
        style,
      ]}
    >
      <View style={styles.leftSlot}>
        {leftSlot ? (
          leftSlot
        ) : leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={22}
            color={leftIconColor ?? (destructive ? colors.error : colors.textSecondary)}
          />
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.rightSlot}>
        {rightSlot ? (
          rightSlot
        ) : onPress && chevron ? (
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        hitSlop={hitSlop.sm}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={subtitle}
        accessibilityState={{ disabled }}
        style={({ pressed }) => [pressed && { backgroundColor: colors.backgroundSecondary }]}
      >
        {inner}
      </Pressable>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  divided: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  leftSlot: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  rightSlot: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
  },
  subtitle: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: fontSize.xs * lineHeight.normal,
  },
});

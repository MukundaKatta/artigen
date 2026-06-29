import React from 'react';
import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  fontSize,
  typography,
  borderRadius,
  hitSlop,
  lineHeight,
  withOpacity,
} from '@/lib/theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  accent?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Compact informational tile used in marketing pages, settings sections,
 * onboarding cards. Differs from `Card` in having a fixed icon + title +
 * description shape.
 */
export function InfoTile({
  icon,
  title,
  description,
  accent = colors.primary,
  onPress,
  style,
}: Props) {
  const inner = (
    <View style={[styles.tile, style]}>
      <View style={[styles.iconBg, { backgroundColor: withOpacity(accent, 0.12) }]}>
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={hitSlop.sm}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={description}
        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
      >
        {inner}
      </Pressable>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  description: {
    marginTop: 2,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
});

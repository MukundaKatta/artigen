import React from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  fontSize,
  typography,
  borderRadius,
  hitSlop,
  feedback,
  letterSpacing,
} from '@/lib/theme';

type TagTone = 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'primary';

type Props = {
  label: string;
  tone?: TagTone;
  /** Renders an "×" press target after the label. */
  onRemove?: () => void;
  /** Whole tag becomes a press target. */
  onPress?: () => void;
  selected?: boolean;
  /** Lead icon shown before the label. */
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
};

const TONE_FG: Record<TagTone, string> = {
  neutral: colors.textSecondary,
  info: feedback.info.fg,
  success: feedback.success.fg,
  warning: feedback.warning.fg,
  error: feedback.error.fg,
  primary: colors.primary,
};

const TONE_BG: Record<TagTone, string> = {
  neutral: colors.backgroundSecondary,
  info: feedback.info.bg,
  success: feedback.success.bg,
  warning: feedback.warning.bg,
  error: feedback.error.bg,
  primary: 'rgba(0, 149, 246, 0.10)',
};

export function Tag({
  label,
  tone = 'neutral',
  onRemove,
  onPress,
  selected = false,
  icon,
  style,
}: Props) {
  const fg = TONE_FG[tone];
  const bg = selected ? fg : TONE_BG[tone];
  const labelColor = selected ? colors.textLight : fg;

  const content = (
    <>
      {icon ? (
        <Ionicons name={icon} size={12} color={labelColor} style={{ marginRight: spacing.xxs }} />
      ) : null}
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={hitSlop.md}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          style={({ pressed }) => [{ marginLeft: spacing.xxs }, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="close" size={12} color={labelColor} />
        </Pressable>
      ) : null}
    </>
  );

  const containerStyle = [styles.tag, { backgroundColor: bg, borderColor: fg }, style];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={hitSlop.sm}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        style={({ pressed }) => [containerStyle, pressed && { opacity: 0.7 }]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    letterSpacing: letterSpacing.wide,
  },
});

/** Horizontal scrolling row of tags. */
export function TagRow({
  children,
  gap = spacing.xs,
}: {
  children: React.ReactNode;
  gap?: number;
}) {
  return (
    <View style={[styles.tag, { flexWrap: 'wrap', gap, borderWidth: 0, padding: 0 }]}>
      {children}
    </View>
  );
}

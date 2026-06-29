import React from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  fontSize,
  typography,
  borderRadius,
  feedback,
  hitSlop,
  lineHeight,
} from '@/lib/theme';

type BannerTone = 'info' | 'success' | 'warning' | 'error' | 'neutral';

type Props = {
  message: string;
  title?: string;
  tone?: BannerTone;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
};

const TONE_ICONS: Record<BannerTone, keyof typeof Ionicons.glyphMap> = {
  info: 'information-circle',
  success: 'checkmark-circle',
  warning: 'warning',
  error: 'alert-circle',
  neutral: 'sparkles',
};

const TONE_COLORS: Record<BannerTone, { fg: string; bg: string }> = {
  info: feedback.info,
  success: feedback.success,
  warning: feedback.warning,
  error: feedback.error,
  neutral: feedback.neutral,
};

/**
 * Inline informational banner. Drop it inside a screen above content.
 * Differs from Toast (transient) in that the banner persists until the
 * caller decides to remove it.
 */
export function Banner({
  message,
  title,
  tone = 'info',
  icon,
  actionLabel,
  onAction,
  onDismiss,
  style,
}: Props) {
  const palette = TONE_COLORS[tone];
  const iconName = icon ?? TONE_ICONS[tone];

  return (
    <View
      style={[styles.banner, { backgroundColor: palette.bg }, style]}
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
    >
      <Ionicons name={iconName} size={18} color={palette.fg} style={styles.icon} />
      <View style={styles.body}>
        {title ? <Text style={[styles.title, { color: palette.fg }]}>{title}</Text> : null}
        <Text style={[styles.message, title ? styles.messageWithTitle : null]}>{message}</Text>
        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            hitSlop={hitSlop.md}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.actionText, { color: palette.fg }]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          hitSlop={hitSlop.md}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={styles.dismiss}
        >
          <Ionicons name="close" size={16} color={palette.fg} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  icon: {
    marginTop: 2,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    marginBottom: 2,
  },
  message: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  messageWithTitle: {
    marginTop: 0,
  },
  actionBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
  },
  dismiss: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
});

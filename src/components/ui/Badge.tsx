import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import {
  colors,
  spacing,
  fontSize,
  typography,
  borderRadius,
  feedback,
  letterSpacing,
} from '@/lib/theme';

type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'primary' | 'accent';
type BadgeSize = 'xs' | 'sm' | 'md';

type Props = {
  label: string | number;
  tone?: BadgeTone;
  size?: BadgeSize;
  /** Outlined version (transparent fill, coloured border). */
  outlined?: boolean;
  /** Pill = full-rounded corners; tag = sm rounded. */
  shape?: 'pill' | 'tag';
  /** Cap to "99+" if number larger than 99. */
  cap99?: boolean;
  style?: StyleProp<ViewStyle>;
};

const TONE_FG: Record<BadgeTone, string> = {
  neutral: feedback.neutral.fg,
  info: feedback.info.fg,
  success: feedback.success.fg,
  warning: feedback.warning.fg,
  error: feedback.error.fg,
  primary: colors.primary,
  accent: colors.accent,
};

const TONE_BG: Record<BadgeTone, string> = {
  neutral: feedback.neutral.bg,
  info: feedback.info.bg,
  success: feedback.success.bg,
  warning: feedback.warning.bg,
  error: feedback.error.bg,
  primary: 'rgba(0, 149, 246, 0.1)',
  accent: 'rgba(139, 92, 246, 0.12)',
};

const SIZE_PX: Record<BadgeSize, { pY: number; pX: number; font: number }> = {
  xs: { pY: 1, pX: spacing.xs, font: fontSize['2xs'] },
  sm: { pY: 2, pX: spacing.sm, font: fontSize.xs },
  md: { pY: spacing.xxs, pX: spacing.md, font: fontSize.sm },
};

export function Badge({
  label,
  tone = 'neutral',
  size = 'sm',
  outlined = false,
  shape = 'pill',
  cap99 = false,
  style,
}: Props) {
  const dims = SIZE_PX[size];
  const fg = TONE_FG[tone];
  const bg = TONE_BG[tone];
  const value = cap99 && typeof label === 'number' && label > 99 ? '99+' : String(label);

  return (
    <View
      style={[
        styles.badge,
        {
          paddingVertical: dims.pY,
          paddingHorizontal: dims.pX,
          borderRadius: shape === 'pill' ? borderRadius.full : borderRadius.sm,
          backgroundColor: outlined ? 'transparent' : bg,
          borderColor: fg,
          borderWidth: outlined ? 1 : 0,
        },
        style,
      ]}
      accessibilityRole="text"
    >
      <Text
        style={[
          styles.label,
          {
            fontSize: dims.font,
            color: outlined ? fg : fg,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/** Compact dot indicator (no label) — used as an unread marker. */
export function BadgeDot({ tone = 'primary', size = 8 }: { tone?: BadgeTone; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: TONE_FG[tone],
      }}
      accessibilityLabel="Unread"
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: typography.semiBold,
    letterSpacing: letterSpacing.wide,
  },
});

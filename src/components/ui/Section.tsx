import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, letterSpacing, hitSlop } from '@/lib/theme';

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
  /** Tightens the inner padding for nested sections. */
  dense?: boolean;
  /** Bottom divider after the section. */
  divided?: boolean;
};

/**
 * Standard screen section: header with optional inline "See all" action,
 * then content. Used to be hand-rolled in every screen — now consistent.
 */
export function Section({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
  dense = false,
  divided = false,
}: Props) {
  return (
    <View style={[styles.section, dense && styles.sectionDense, divided && styles.divided]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            hitSlop={hitSlop.md}
            accessibilityRole="button"
            accessibilityLabel={`${actionLabel} ${title}`}
            style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: spacing.lg,
  },
  sectionDense: {
    paddingVertical: spacing.sm,
  },
  divided: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    letterSpacing: letterSpacing.tight,
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
  },
  actionPressed: {
    opacity: 0.6,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.primary,
  },
});

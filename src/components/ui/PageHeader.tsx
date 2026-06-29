import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize, typography, letterSpacing, hitSlop } from '@/lib/theme';

type Action = {
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
  onPress: () => void;
  accessibilityLabel?: string;
  /** Visual emphasis. */
  primary?: boolean;
};

type Props = {
  title: string;
  subtitle?: string;
  /** Show a back chevron. Defaults to true unless `onBack` is null. */
  back?: boolean;
  onBack?: () => void;
  /** Right-side actions, max 3. */
  actions?: Action[];
  /** Hairline border at the bottom. */
  divided?: boolean;
};

export function PageHeader({
  title,
  subtitle,
  back = true,
  onBack,
  actions = [],
  divided = false,
}: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  };

  return (
    <View style={[styles.header, divided && styles.divided]}>
      {back ? (
        <Pressable
          onPress={handleBack}
          hitSlop={hitSlop.lg}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
      ) : null}
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        {actions.slice(0, 3).map((a, i) => (
          <Pressable
            key={a.accessibilityLabel ?? a.label ?? i}
            onPress={a.onPress}
            hitSlop={hitSlop.md}
            accessibilityRole="button"
            accessibilityLabel={a.accessibilityLabel ?? a.label ?? a.icon}
            style={({ pressed }) => [
              a.primary ? styles.primaryAction : styles.action,
              pressed && { opacity: 0.6 },
            ]}
          >
            {a.icon ? (
              <Ionicons
                name={a.icon}
                size={20}
                color={a.primary ? colors.textLight : colors.text}
              />
            ) : null}
            {a.label ? (
              <Text style={[styles.actionLabel, a.primary && { color: colors.textLight }]}>
                {a.label}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  divided: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    letterSpacing: letterSpacing.tight,
  },
  subtitle: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  action: {
    height: 36,
    minWidth: 36,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  primaryAction: {
    height: 36,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: 18,
  },
  actionLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
});

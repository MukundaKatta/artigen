import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  colors,
  spacing,
  fontSize,
  borderRadius,
  typography,
  lineHeight,
  opacity as opacityScale,
  hitSlop,
} from '@/lib/theme';

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  secondaryActionLabel?: string;
  onAction?: () => void;
  onSecondaryAction?: () => void;
  tone?: 'neutral' | 'positive' | 'warning';
};

const TONE_ACCENT: Record<NonNullable<EmptyStateProps['tone']>, string> = {
  neutral: colors.textSecondary,
  positive: colors.success,
  warning: colors.warning,
};

/**
 * Reusable empty state component for screens with no content.
 * Provides consistent UX across feed, search, messages, etc.
 */
export function EmptyState({
  icon = 'layers-outline',
  title,
  message,
  actionLabel,
  secondaryActionLabel,
  onAction,
  onSecondaryAction,
  tone = 'neutral',
}: EmptyStateProps) {
  const handlePrimary = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onAction?.();
  };
  const handleSecondary = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onSecondaryAction?.();
  };

  return (
    <View style={styles.container} accessibilityRole="summary" accessibilityLabel={title}>
      <View style={styles.iconHalo}>
        <Ionicons name={icon} size={48} color={TONE_ACCENT[tone]} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handlePrimary}
          hitSlop={hitSlop.md}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      {secondaryActionLabel && onSecondaryAction ? (
        <Pressable
          style={styles.secondaryButton}
          onPress={handleSecondary}
          hitSlop={hitSlop.md}
          accessibilityRole="button"
          accessibilityLabel={secondaryActionLabel}
        >
          <Text style={styles.secondaryButtonText}>{secondaryActionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ── Preset Empty States ──────────────────────────────────────────

export function EmptyFeed({ onExplore }: { onExplore?: () => void }) {
  return (
    <EmptyState
      icon="images-outline"
      title="Your feed is empty"
      message="Follow other creators to see their artwork here"
      actionLabel="Explore"
      onAction={onExplore}
    />
  );
}

export function EmptySearch() {
  return (
    <EmptyState
      icon="search-outline"
      title="No results found"
      message="Try adjusting your search or browse trending content"
    />
  );
}

export function EmptyMessages({ onNewMessage }: { onNewMessage?: () => void }) {
  return (
    <EmptyState
      icon="chatbubble-outline"
      title="No messages yet"
      message="Start a conversation with fellow creators"
      actionLabel="New Message"
      onAction={onNewMessage}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon="notifications-outline"
      title="No notifications"
      message="Interactions with your posts will appear here"
    />
  );
}

export function EmptyCollection({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="bookmark-outline"
      title="Nothing saved yet"
      message="Save posts you love to find them later"
      actionLabel="Browse"
      onAction={onAdd}
    />
  );
}

export function EmptyComments() {
  return (
    <EmptyState
      icon="chatbubbles-outline"
      title="No comments yet"
      message="Be the first to share your thoughts"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxxl * 2,
  },
  iconHalo: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.md * lineHeight.normal,
    marginBottom: spacing.xl,
    maxWidth: 320,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 44,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: opacityScale.pressed,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: colors.textLight,
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
  },
  secondaryButton: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
  },
});

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius, typography } from '@/lib/theme';

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Reusable empty state component for screens with no content.
 * Provides consistent UX across feed, search, messages, etc.
 */
export function EmptyState({ icon = 'layers-outline', title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.textSecondary} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <Pressable style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
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
  icon: {
    marginBottom: spacing.lg,
    opacity: 0.5,
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
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
  },
});

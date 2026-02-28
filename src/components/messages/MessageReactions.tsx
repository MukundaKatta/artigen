import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, borderRadius, typography } from '@/lib/theme';
import type { MessageReaction } from '@/services/reaction.service';

type Props = {
  reactions: MessageReaction[];
  currentUserId: string;
  onToggle: (emoji: string) => void;
  isMine: boolean;
};

export function MessageReactions({ reactions, currentUserId, onToggle, isMine }: Props) {
  if (!reactions || reactions.length === 0) return null;

  // Group reactions by emoji
  const grouped = new Map<string, { count: number; hasOwn: boolean }>();
  reactions.forEach((r) => {
    const existing = grouped.get(r.emoji) || { count: 0, hasOwn: false };
    existing.count++;
    if (r.user_id === currentUserId) existing.hasOwn = true;
    grouped.set(r.emoji, existing);
  });

  return (
    <View style={[styles.container, isMine && styles.containerMine]}>
      {Array.from(grouped.entries()).map(([emoji, { count, hasOwn }]) => (
        <TouchableOpacity
          key={emoji}
          style={[styles.pill, hasOwn && styles.pillOwn]}
          onPress={() => onToggle(emoji)}
          activeOpacity={0.7}
        >
          <Text style={styles.emoji}>{emoji}</Text>
          {count > 1 && <Text style={styles.count}>{count}</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
    marginBottom: spacing.xs,
    paddingLeft: 44,
  },
  containerMine: {
    justifyContent: 'flex-end',
    paddingLeft: 0,
    paddingRight: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillOwn: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 149, 246, 0.1)',
  },
  emoji: {
    fontSize: 14,
  },
  count: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.medium,
    marginLeft: 2,
  },
});

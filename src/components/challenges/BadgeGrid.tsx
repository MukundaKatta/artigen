import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import type { Badge, UserBadge } from '@/types/database';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export type UserBadgeWithBadge = UserBadge & {
  badge?: (Pick<Badge, 'name'> & { icon: IoniconName }) | null;
};

type Props = { badges: UserBadgeWithBadge[] };

export function BadgeGrid({ badges }: Props) {
  if (badges.length === 0) return <Text style={styles.empty}>No badges yet</Text>;
  return (
    <View style={styles.grid}>
      {badges.map(b => (
        <View key={b.id} style={styles.badge}>
          {b.badge?.icon ? (
            <View style={styles.iconContainer}>
              <Ionicons name={b.badge.icon} size={28} color={colors.primary} />
            </View>
          ) : (
            <View style={styles.iconPlaceholder}>
              <Text style={styles.iconText}>{b.badge?.name?.[0]?.toUpperCase() || '?'}</Text>
            </View>
          )}
          <Text style={styles.name} numberOfLines={1}>{b.badge?.name || 'Badge'}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, padding: spacing.md },
  badge: { alignItems: 'center', width: 72 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  iconPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: fontSize.lg, fontFamily: typography.bold, color: colors.primary },
  name: { fontSize: fontSize.xs, color: colors.text, marginTop: 4, textAlign: 'center' },
  empty: { textAlign: 'center', color: colors.textSecondary, padding: spacing.lg, fontSize: fontSize.sm },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';
import type { BattleWithUsers } from '@/services/battle.service';

type Props = {
  battle: BattleWithUsers;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  waiting: { label: 'WAITING', color: colors.warning, icon: 'hourglass-outline' },
  active: { label: 'LIVE', color: colors.error, icon: 'flash' },
  voting: { label: 'VOTING', color: '#8B5CF6', icon: 'thumbs-up-outline' },
  completed: { label: 'DONE', color: colors.success, icon: 'checkmark-circle-outline' },
};

export function BattleCard({ battle }: Props) {
  const router = useRouter();
  const config = STATUS_CONFIG[battle.status] || STATUS_CONFIG.waiting;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(screens)/battle/${battle.id}`)}
      activeOpacity={0.7}
    >
      {/* Status badge */}
      <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
        <Ionicons name={config.icon as any} size={10} color="#fff" />
        <Text style={styles.statusText}>{config.label}</Text>
      </View>

      {/* Theme + title */}
      <Text style={styles.title} numberOfLines={1}>{battle.title}</Text>
      <Text style={styles.theme} numberOfLines={1}>{battle.theme}</Text>

      {/* Participants */}
      <View style={styles.participantsRow}>
        <View style={styles.participant}>
          <Avatar uri={battle.creator?.avatar_url} size="sm" />
          <Text style={styles.username} numberOfLines={1}>
            {battle.creator?.username || 'Creator'}
          </Text>
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <View style={styles.participant}>
          {battle.opponent ? (
            <>
              <Avatar uri={battle.opponent.avatar_url} size="sm" />
              <Text style={styles.username} numberOfLines={1}>
                {battle.opponent.username}
              </Text>
            </>
          ) : (
            <>
              <View style={styles.emptyAvatar}>
                <Ionicons name="help" size={16} color={colors.textSecondary} />
              </View>
              <Text style={styles.waitingText}>Waiting...</Text>
            </>
          )}
        </View>
      </View>

      {/* Time limit */}
      <View style={styles.metaRow}>
        <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
        <Text style={styles.metaText}>{battle.time_limit_minutes}m limit</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  statusText: {
    fontSize: 10,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  theme: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  participant: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  username: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
    flex: 1,
  },
  vsContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  vsText: {
    fontSize: fontSize.xs,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.error,
  },
  emptyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
});

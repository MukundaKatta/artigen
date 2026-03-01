import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { WeeklyEvent } from '@/services/weekly-event.service';

type Props = {
  event: WeeklyEvent;
};

export function WeeklyEventBanner({ event }: Props) {
  const router = useRouter();

  const endsAt = new Date(event.ends_at);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={() => router.push('/(screens)/weekly-event')}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="flame" size={24} color={colors.warning} />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.label}>WEEKLY EVENT</Text>
          <Text style={styles.hashtag}>{event.hashtag}</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.theme} numberOfLines={1}>Theme: {event.theme}</Text>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.daysLeft}>{daysLeft}d</Text>
        <Text style={styles.daysLabel}>left</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.warning + '25',
    gap: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  label: {
    fontSize: 9,
    fontFamily: typography.bold,
    color: colors.warning,
    letterSpacing: 1,
  },
  hashtag: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.primary,
  },
  title: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  theme: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 1,
  },
  rightSection: {
    alignItems: 'center',
  },
  daysLeft: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    color: colors.warning,
  },
  daysLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
});

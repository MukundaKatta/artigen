import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  startsAt: string;
  compact?: boolean;
};

function getTimeRemaining(startsAt: string) {
  const diff = new Date(startsAt).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, expired: false };
}

export function EventCountdown({ startsAt, compact = false }: Props) {
  const [time, setTime] = useState(getTimeRemaining(startsAt));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTime(getTimeRemaining(startsAt));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startsAt]);

  if (time.expired) {
    return (
      <View style={compact ? styles.compactContainer : styles.container}>
        <Text style={compact ? styles.compactExpired : styles.expired}>Event has started</Text>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactText}>
          {time.days > 0 ? `${time.days}d ` : ''}
          {String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}:
          {String(time.seconds).padStart(2, '0')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Starts in</Text>
      <View style={styles.blocks}>
        {time.days > 0 && (
          <View style={styles.block}>
            <Text style={styles.blockValue}>{time.days}</Text>
            <Text style={styles.blockLabel}>days</Text>
          </View>
        )}
        <View style={styles.block}>
          <Text style={styles.blockValue}>{String(time.hours).padStart(2, '0')}</Text>
          <Text style={styles.blockLabel}>hrs</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.blockValue}>{String(time.minutes).padStart(2, '0')}</Text>
          <Text style={styles.blockLabel}>min</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.blockValue}>{String(time.seconds).padStart(2, '0')}</Text>
          <Text style={styles.blockLabel}>sec</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  blocks: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  block: {
    alignItems: 'center',
    backgroundColor: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 52,
  },
  blockValue: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: colors.textLight,
  },
  blockLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textLight + 'AA',
    marginTop: 2,
  },
  expired: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.success,
  },
  // Compact
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.primary,
  },
  compactExpired: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.success,
  },
});

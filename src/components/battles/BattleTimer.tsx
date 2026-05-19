import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { BATTLE_TIMER_TICK_MS } from '@/lib/constants';

type Props = {
  /** ISO timestamp when the battle started */
  startedAt: string | null;
  /** Time limit in minutes */
  timeLimitMinutes: number;
  /** Battle status */
  status: string;
  /** Callback when timer hits zero */
  onTimeUp?: () => void;
};

function formatTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function BattleTimer({ startedAt, timeLimitMinutes, status, onTimeUp }: Props) {
  const [remaining, setRemaining] = useState<number>(timeLimitMinutes * 60);
  const calledTimeUp = useRef(false);

  useEffect(() => {
    if (!startedAt || status !== 'active') return;

    const endTime = new Date(startedAt).getTime() + timeLimitMinutes * 60 * 1000;

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((endTime - now) / 1000));
      setRemaining(diff);

      if (diff <= 0 && !calledTimeUp.current) {
        calledTimeUp.current = true;
        onTimeUp?.();
      }
    };

    tick();
    const interval = setInterval(tick, BATTLE_TIMER_TICK_MS);
    return () => clearInterval(interval);
  }, [startedAt, timeLimitMinutes, status, onTimeUp]);

  const isUrgent = remaining <= 60 && remaining > 0;
  const isExpired = remaining <= 0 && status === 'active';
  const timerColor = isExpired ? colors.error : isUrgent ? colors.warning : colors.text;

  if (status === 'completed') {
    return (
      <View style={styles.container}>
        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
        <Text style={[styles.timerText, { color: colors.success }]}>Completed</Text>
      </View>
    );
  }

  if (status === 'voting') {
    return (
      <View style={styles.container}>
        <Ionicons name="thumbs-up" size={16} color={colors.accent} />
        <Text style={[styles.timerText, { color: colors.accent }]}>Voting Phase</Text>
      </View>
    );
  }

  if (status === 'waiting') {
    return (
      <View style={styles.container}>
        <Ionicons name="hourglass-outline" size={16} color={colors.textSecondary} />
        <Text style={[styles.timerText, { color: colors.textSecondary }]}>
          Waiting for opponent
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isUrgent && styles.urgentContainer]}>
      <Ionicons name={isExpired ? 'alarm' : 'time-outline'} size={16} color={timerColor} />
      <Text style={[styles.timerText, { color: timerColor }]}>
        {isExpired ? 'Time is up!' : formatTime(remaining)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    alignSelf: 'center',
  },
  urgentContainer: {
    backgroundColor: colors.warning + '15',
  },
  timerText: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    fontWeight: '700',
  },
});

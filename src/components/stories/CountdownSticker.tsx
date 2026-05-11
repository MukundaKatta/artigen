import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius, withOpacity } from '@/lib/theme';
import type { StorySticker } from '@/types';

type Props = {
  sticker: StorySticker;
  userId: string;
  onRespond: (response: Record<string, unknown>) => void;
};

export function CountdownSticker({ sticker, onRespond }: Props) {
  const config = sticker.config as { title: string; end_time: string };
  const [timeLeft, setTimeLeft] = useState('');
  const [reminded, setReminded] = useState(false);

  useEffect(() => {
    function update() {
      const diff = new Date(config.end_time).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Ended!');
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [config.end_time]);

  function handleRemind() {
    setReminded(true);
    onRespond({ remind: true });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{config.title || 'Countdown'}</Text>
      <Text style={styles.time}>{timeLeft}</Text>
      <TouchableOpacity
        style={[styles.remindButton, reminded && styles.remindedButton]}
        onPress={handleRemind}
        disabled={reminded}
      >
        <Ionicons
          name={reminded ? 'notifications' : 'notifications-outline'}
          size={14}
          color={colors.textLight}
        />
        <Text style={styles.remindText}>
          {reminded ? 'Reminded' : 'Remind Me'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: 180,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.sm,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.textLight,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  time: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  remindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: withOpacity(colors.textLight, 0.2),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  remindedButton: {
    backgroundColor: withOpacity(colors.textLight, 0.4),
  },
  remindText: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textLight,
  },
});

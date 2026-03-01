import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getActivityText } from '@/services/activity.service';
import { colors, fontSize, typography } from '@/lib/theme';

type Props = {
  lastActiveAt?: string | null;
  showActivityStatus?: boolean;
  showText?: boolean;
};

export function OnlineIndicator({ lastActiveAt, showActivityStatus = true, showText = false }: Props) {
  if (!showActivityStatus || !lastActiveAt) return null;

  const text = getActivityText(lastActiveAt);
  const isOnline = text === 'Active now';

  if (!showText) {
    return isOnline ? <View style={styles.dot} /> : null;
  }

  if (!text) return null;

  return (
    <Text style={[styles.text, isOnline && styles.textOnline]}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  text: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  textOnline: {
    color: colors.success,
  },
});

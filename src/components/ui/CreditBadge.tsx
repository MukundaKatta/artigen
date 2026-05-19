import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useAuth } from '@/providers/AuthProvider';
import { getUserCredits } from '@/services/credits.service';
import { colors, fontSize, typography, borderRadius, spacing } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';
import { logger } from '@/lib/logger';
import { CREDIT_REFRESH_INTERVAL_MS } from '@/lib/constants';

// Explicit (currently empty) props contract — #218.
export type CreditBadgeProps = Record<string, never>;

export function CreditBadge(_: CreditBadgeProps = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!user?.id) return;
    try {
      const balance = await getUserCredits(user.id);
      setCredits(balance);
    } catch (err) {
      logger.warn('CreditBadge: failed to fetch credits', err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCredits();
    const interval = setInterval(fetchCredits, CREDIT_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchCredits]);

  if (credits === null) return null;

  return (
    <AnimatedPressable
      style={styles.badge}
      onPress={() => router.push('/(screens)/buy-credits')}
      scaleValue={0.95}
      accessibilityRole="button"
      accessibilityLabel={`${credits} credits. Tap to buy more.`}
    >
      <Ionicons name="flash" size={14} color={colors.warning} />
      <Text style={styles.text}>{formatNumber(credits)}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
});

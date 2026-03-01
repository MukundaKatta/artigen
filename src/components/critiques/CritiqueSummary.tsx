import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { CritiqueSummary as CritiqueSummaryType } from '@/services/critique.service';

type Props = {
  summary: CritiqueSummaryType;
};

type RatingBarProps = {
  label: string;
  value: number;
};

function RatingBar({ label, value }: RatingBarProps) {
  const percentage = (value / 5) * 100;

  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${percentage}%` }]} />
      </View>
      <View style={styles.barValueRow}>
        <Ionicons name="star" size={12} color="#F59E0B" />
        <Text style={styles.barValue}>{value > 0 ? value.toFixed(1) : '-'}</Text>
      </View>
    </View>
  );
}

export function CritiqueSummaryCard({ summary }: Props) {
  if (summary.totalCritiques === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={32} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No critiques yet</Text>
        <Text style={styles.emptySubtext}>Be the first to share your feedback!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Overall score */}
      <View style={styles.overallRow}>
        <View style={styles.overallScoreBox}>
          <Text style={styles.overallScore}>{summary.avgOverall.toFixed(1)}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= Math.round(summary.avgOverall) ? 'star' : 'star-outline'}
                size={14}
                color="#F59E0B"
              />
            ))}
          </View>
          <Text style={styles.critiqueCount}>
            {summary.totalCritiques} {summary.totalCritiques === 1 ? 'critique' : 'critiques'}
          </Text>
        </View>

        {/* Category bars */}
        <View style={styles.barsContainer}>
          <RatingBar label="Composition" value={summary.avgComposition} />
          <RatingBar label="Color" value={summary.avgColor} />
          <RatingBar label="Technique" value={summary.avgTechnique} />
          <RatingBar label="Prompt Craft" value={summary.avgPromptCraft} />
          <RatingBar label="Originality" value={summary.avgOriginality} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  overallRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  overallScoreBox: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  overallScore: {
    fontSize: fontSize.xxxl,
    fontFamily: typography.bold,
    color: colors.text,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  critiqueCount: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  barsContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    width: 76,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  barValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 40,
  },
  barValue: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
});

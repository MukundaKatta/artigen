import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { REACTION_EMOJIS } from '@/services/post-reaction.service';
import { colors, fontSize, typography, spacing } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';
import type { ReactionSummary as ReactionSummaryType } from '@/types';

type Props = {
  summary: ReactionSummaryType[];
  totalCount: number;
};

export const ReactionSummary = React.memo(function ReactionSummary({ summary, totalCount }: Props) {
  if (totalCount === 0 || summary.length === 0) return null;

  const top3 = summary.slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.emojis}>
        {top3.map((s) => (
          <Text key={s.type} style={styles.emoji}>
            {REACTION_EMOJIS[s.type]}
          </Text>
        ))}
      </View>
      <Text style={styles.count}>
        {formatNumber(totalCount)} {totalCount === 1 ? 'reaction' : 'reactions'}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  emojis: {
    flexDirection: 'row',
    marginRight: spacing.xs,
  },
  emoji: {
    fontSize: 14,
    marginRight: -2,
  },
  count: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
});

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type PollOption = {
  id: string;
  text: string;
  vote_count: number;
};

type Props = {
  question: string;
  options: PollOption[];
  userVoteOptionId?: string;
  endsAt?: string;
  onVote: (optionId: string) => void;
};

const PURPLE = colors.accent;
const PURPLE_BG = 'rgba(139, 92, 246, 0.10)';
const PURPLE_BAR = 'rgba(139, 92, 246, 0.25)';
const PURPLE_BAR_SELECTED = 'rgba(139, 92, 246, 0.45)';

function AnimatedBar({ percentage, isSelected, hasVoted }: {
  percentage: number;
  isSelected: boolean;
  hasVoted: boolean;
}) {
  const width = useSharedValue(0);

  useEffect(() => {
    if (hasVoted) {
      width.value = withTiming(percentage, { duration: 500 });
    }
  }, [hasVoted, percentage, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    backgroundColor: isSelected ? PURPLE_BAR_SELECTED : PURPLE_BAR,
  }));

  if (!hasVoted) return null;

  return <Animated.View style={[styles.bar, animatedStyle]} />;
}

export const PollCard = React.memo(function PollCard({ question, options, userVoteOptionId, endsAt, onVote }: Props) {
  const hasVoted = !!userVoteOptionId;
  const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);

  const isExpired = endsAt ? new Date(endsAt) < new Date() : false;
  const canVote = !hasVoted && !isExpired;

  return (
    <View style={styles.container}>
      {/* Poll header */}
      <View style={styles.header}>
        <Ionicons name="stats-chart" size={16} color={PURPLE} />
        <Text style={styles.question}>{question}</Text>
      </View>

      {/* Options */}
      {options.map((option) => {
        const percentage = totalVotes > 0
          ? Math.round((option.vote_count / totalVotes) * 100)
          : 0;
        const isSelected = userVoteOptionId === option.id;

        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionRow,
              isSelected && styles.optionRowSelected,
            ]}
            onPress={() => {
              if (canVote) {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onVote(option.id);
              }
            }}
            activeOpacity={canVote ? 0.7 : 1}
            disabled={!canVote}
          >
            <AnimatedBar
              percentage={percentage}
              isSelected={isSelected}
              hasVoted={hasVoted}
            />
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={16} color={PURPLE} style={styles.checkIcon} />
                )}
                <Text style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}>
                  {option.text}
                </Text>
              </View>
              {hasVoted && (
                <Text style={[
                  styles.percentageText,
                  isSelected && styles.percentageTextSelected,
                ]}>
                  {percentage}%
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.totalVotes}>
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </Text>
        {isExpired && (
          <Text style={styles.expiredText}>Poll ended</Text>
        )}
        {endsAt && !isExpired && (
          <Text style={styles.endsAtText}>Poll active</Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    backgroundColor: PURPLE_BG,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  question: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  optionRow: {
    position: 'relative',
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionRowSelected: {
    borderColor: PURPLE,
  },
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: borderRadius.md,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    zIndex: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkIcon: {
    marginRight: spacing.xs,
  },
  optionText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
  },
  optionTextSelected: {
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: PURPLE,
  },
  percentageText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  percentageTextSelected: {
    color: PURPLE,
    fontFamily: typography.semiBold,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  totalVotes: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  expiredText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  endsAtText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: PURPLE,
  },
});

import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';

type Props = {
  entryId: string;
  voteCount: number;
  isVoted: boolean;
  disabled?: boolean;
  onPress: (entryId: string) => void;
};

export function BattleVoteButton({ entryId, voteCount, isVoted, disabled, onPress }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isVoted) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [isVoted, scaleAnim]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isVoted && styles.votedContainer,
        disabled && styles.disabledContainer,
      ]}
      onPress={() => onPress(entryId)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={isVoted ? 'heart' : 'heart-outline'}
          size={20}
          color={isVoted ? '#fff' : colors.text}
        />
      </Animated.View>
      <Text style={[styles.count, isVoted && styles.votedCount]}>
        {formatNumber(voteCount)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  votedContainer: {
    backgroundColor: colors.like,
    borderColor: colors.like,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  count: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  votedCount: {
    color: '#fff',
  },
});

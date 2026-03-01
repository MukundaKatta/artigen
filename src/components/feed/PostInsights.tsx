import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, typography, spacing } from '@/lib/theme';

type Props = {
  viewsCount: number;
  onPress: () => void;
};

export function PostInsightsButton({ viewsCount, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Ionicons name="bar-chart-outline" size={14} color={colors.primary} />
      <Text style={styles.text}>View insights</Text>
      {viewsCount > 0 && (
        <Text style={styles.views}>{viewsCount} views</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  text: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.primary,
  },
  views: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginLeft: 'auto',
  },
});

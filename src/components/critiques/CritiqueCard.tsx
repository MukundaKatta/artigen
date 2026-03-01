import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { RatingStars } from '@/components/critiques/RatingStars';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { timeAgo } from '@/utils/format-date';
import type { Critique } from '@/services/critique.service';

type Props = {
  critique: Critique;
  isHelpful: boolean;
  onToggleHelpful: (critiqueId: string) => void;
  onUserPress?: (userId: string) => void;
};

export function CritiqueCard({ critique, isHelpful, onToggleHelpful, onUserPress }: Props) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userRow}
          onPress={() => onUserPress?.(critique.user.id)}
          activeOpacity={0.7}
        >
          <Avatar uri={critique.user.avatar_url} size="sm" />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{critique.user.username}</Text>
            <Text style={styles.timestamp}>{timeAgo(critique.created_at)}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.overallBadge}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.overallText}>{critique.overall_rating}</Text>
        </View>
      </View>

      {/* Ratings grid */}
      <View style={styles.ratingsGrid}>
        <View style={styles.ratingRow}>
          <RatingStars label="Composition" value={critique.composition_rating} readonly size={14} />
        </View>
        <View style={styles.ratingRow}>
          <RatingStars label="Color" value={critique.color_rating} readonly size={14} />
        </View>
        <View style={styles.ratingRow}>
          <RatingStars label="Technique" value={critique.technique_rating} readonly size={14} />
        </View>
        <View style={styles.ratingRow}>
          <RatingStars label="Prompt Craft" value={critique.prompt_craft_rating} readonly size={14} />
        </View>
        <View style={styles.ratingRow}>
          <RatingStars label="Originality" value={critique.originality_rating} readonly size={14} />
        </View>
      </View>

      {/* Feedback text */}
      <Text style={styles.feedbackText}>{critique.feedback_text}</Text>

      {/* Helpful button */}
      <TouchableOpacity
        style={styles.helpfulRow}
        onPress={() => onToggleHelpful(critique.id)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isHelpful ? 'thumbs-up' : 'thumbs-up-outline'}
          size={16}
          color={isHelpful ? colors.primary : colors.textSecondary}
        />
        <Text style={[styles.helpfulText, isHelpful && styles.helpfulTextActive]}>
          Helpful{critique.helpful_count > 0 ? ` (${critique.helpful_count})` : ''}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userInfo: {
    marginLeft: spacing.sm,
  },
  username: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  timestamp: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 1,
  },
  overallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  overallText: {
    fontSize: fontSize.md,
    fontFamily: typography.bold,
    color: '#F59E0B',
  },
  ratingsGrid: {
    marginBottom: spacing.md,
  },
  ratingRow: {
    marginBottom: 2,
  },
  feedbackText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  helpfulRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  helpfulText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  helpfulTextActive: {
    color: colors.primary,
  },
});

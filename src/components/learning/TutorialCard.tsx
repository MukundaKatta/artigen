import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { Tutorial, UserTutorialProgress } from '@/services/tutorial.service';

type Props = {
  tutorial: Tutorial;
  progress?: UserTutorialProgress | null;
  totalLessons?: number;
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: colors.success,
  intermediate: colors.warning,
  advanced: colors.like,
};

const CATEGORY_LABELS: Record<string, string> = {
  basics: 'Basics',
  prompting: 'Prompting',
  styles: 'Styles',
  advanced: 'Advanced',
  models: 'Models',
  composition: 'Composition',
};

export function TutorialCard({ tutorial, progress, totalLessons }: Props) {
  const router = useRouter();

  function handlePress() {
    router.push(`/(screens)/tutorial/${tutorial.id}`);
  }

  const completedCount = progress?.completed_lessons?.length || 0;
  const total = totalLessons || 1;
  const progressPercent = progress?.is_completed ? 1 : completedCount / Math.max(total, 1);

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      {tutorial.cover_image_url ? (
        <Image
          source={{ uri: tutorial.cover_image_url }}
          style={styles.cover}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Ionicons name="school-outline" size={32} color={colors.textSecondary} />
        </View>
      )}

      <View style={styles.content}>
        {/* Category badge */}
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {CATEGORY_LABELS[tutorial.category] || tutorial.category}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: DIFFICULTY_COLORS[tutorial.difficulty] + '15' }]}>
            <Text style={[styles.badgeText, { color: DIFFICULTY_COLORS[tutorial.difficulty] }]}>
              {tutorial.difficulty}
            </Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>{tutorial.title}</Text>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.metaText}>{tutorial.estimated_minutes}m</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star-outline" size={12} color={colors.warning} />
            <Text style={styles.metaText}>{tutorial.xp_reward} XP</Text>
          </View>
        </View>

        {/* Progress bar */}
        {progress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(progressPercent * 100, 100)}%` },
                  progress.is_completed && styles.progressComplete,
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progress.is_completed ? 'Completed' : `${completedCount}/${total}`}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cover: {
    width: '100%',
    height: 120,
    backgroundColor: colors.border,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.md,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
  },
  title: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressComplete: {
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    minWidth: 60,
    textAlign: 'right',
  },
});

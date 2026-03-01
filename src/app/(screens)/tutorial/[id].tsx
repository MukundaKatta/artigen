import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useTutorial } from '@/hooks/useTutorial';
import { LessonList } from '@/components/learning/LessonList';
import { XpBar } from '@/components/learning/XpBar';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { TutorialLesson } from '@/services/tutorial.service';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: colors.success,
  intermediate: colors.warning,
  advanced: colors.like,
};

export default function TutorialDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { tutorial, lessons, progress, loading } = useTutorial(id, user?.id);

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />
      </View>
    );
  }

  if (!tutorial) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <View style={styles.empty}>
          <Ionicons name="school-outline" size={48} color={colors.border} />
          <Text style={styles.emptyText}>Tutorial not found</Text>
        </View>
      </View>
    );
  }

  const completedCount = progress?.completed_lessons?.length || 0;
  const progressPercent = progress?.is_completed
    ? 100
    : lessons.length > 0
      ? Math.round((completedCount / lessons.length) * 100)
      : 0;

  function handleLessonPress(lessonIndex: number, lesson: TutorialLesson) {
    router.push(`/(screens)/tutorial/lesson/${lesson.id}?tutorialId=${id}&lessonIndex=${lessonIndex}`);
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: tutorial.title }} />
      <ScrollView style={styles.scroll}>
        {/* Cover */}
        {tutorial.cover_image_url ? (
          <Image
            source={{ uri: tutorial.cover_image_url }}
            style={styles.cover}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Ionicons name="school-outline" size={48} color={colors.textSecondary} />
          </View>
        )}

        {/* Info */}
        <View style={styles.infoSection}>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>{tutorial.category}</Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: DIFFICULTY_COLORS[tutorial.difficulty] + '15' },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: DIFFICULTY_COLORS[tutorial.difficulty] },
                ]}
              >
                {tutorial.difficulty}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{tutorial.title}</Text>
          {tutorial.description && (
            <Text style={styles.description}>{tutorial.description}</Text>
          )}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{tutorial.estimated_minutes} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star-outline" size={14} color={colors.warning} />
              <Text style={styles.metaText}>{tutorial.xp_reward} XP</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="list-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{lessons.length} lessons</Text>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%` },
                  progress?.is_completed && styles.progressComplete,
                ]}
              />
            </View>
          </View>
        </View>

        {/* Lessons */}
        <View style={styles.lessonsHeader}>
          <Text style={styles.lessonsTitle}>Lessons</Text>
        </View>
        <LessonList
          lessons={lessons}
          progress={progress}
          onLessonPress={handleLessonPress}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  cover: {
    width: '100%',
    height: 200,
    backgroundColor: colors.backgroundSecondary,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    padding: spacing.lg,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  progressSection: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
  },
  progressPercent: {
    fontSize: fontSize.sm,
    fontFamily: typography.bold,
    color: colors.primary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressComplete: {
    backgroundColor: colors.success,
  },
  lessonsHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lessonsTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xxxl,
  },
});

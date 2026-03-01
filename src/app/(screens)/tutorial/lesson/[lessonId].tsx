import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { getLessons, getProgress, updateProgress, completeTutorial } from '@/services/tutorial.service';
import { awardXp } from '@/services/xp.service';
import { XpRewardToast } from '@/components/learning/XpRewardToast';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { TutorialLesson } from '@/services/tutorial.service';

export default function LessonRoute() {
  const { lessonId, tutorialId, lessonIndex } = useLocalSearchParams<{
    lessonId: string;
    tutorialId: string;
    lessonIndex: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();

  const [lesson, setLesson] = useState<TutorialLesson | null>(null);
  const [allLessons, setAllLessons] = useState<TutorialLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [xpReward, setXpReward] = useState(0);
  const [showXpToast, setShowXpToast] = useState(false);

  const index = parseInt(lessonIndex || '0', 10);

  useEffect(() => {
    (async () => {
      if (!tutorialId) return;
      const { data: lessons } = await getLessons(tutorialId);
      setAllLessons(lessons);

      const found = lessons.find((l) => l.id === lessonId);
      setLesson(found || null);
      setLoading(false);
    })();
  }, [lessonId, tutorialId]);

  const handleComplete = useCallback(async () => {
    if (!user?.id || !tutorialId || !lesson || completing) return;

    setCompleting(true);

    // Update progress
    const { data: progress } = await updateProgress(user.id, tutorialId, index);

    // Award XP for lesson completion
    const xpAmount = lesson.xp_reward || 10;
    await awardXp(user.id, xpAmount, 'lesson', lesson.id);
    setXpReward(xpAmount);
    setShowXpToast(true);

    // Check if all lessons completed
    if (progress && progress.completed_lessons.length >= allLessons.length && allLessons.length > 0) {
      await completeTutorial(user.id, tutorialId);
      // Award tutorial completion XP (handled separately)
    }

    setCompleting(false);
  }, [user?.id, tutorialId, lesson, index, completing, allLessons.length]);

  const handleNext = useCallback(() => {
    if (index < allLessons.length - 1) {
      const nextLesson = allLessons[index + 1];
      router.replace(
        `/(screens)/tutorial/lesson/${nextLesson.id}?tutorialId=${tutorialId}&lessonIndex=${index + 1}`,
      );
    } else {
      // All lessons done, go back to tutorial
      router.back();
    }
  }, [index, allLessons, tutorialId, router]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Lesson not found</Text>
        </View>
      </View>
    );
  }

  const content = lesson.content as Record<string, any>;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Lesson ${index + 1}` }} />

      <XpRewardToast
        amount={xpReward}
        visible={showXpToast}
        onHide={() => setShowXpToast(false)}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Lesson type badge */}
        <View style={styles.typeBadge}>
          <Ionicons
            name={
              lesson.content_type === 'text'
                ? 'document-text-outline'
                : lesson.content_type === 'quiz'
                  ? 'help-circle-outline'
                  : lesson.content_type === 'practice'
                    ? 'brush-outline'
                    : 'hand-left-outline'
            }
            size={14}
            color={colors.primary}
          />
          <Text style={styles.typeBadgeText}>{lesson.content_type}</Text>
        </View>

        <Text style={styles.title}>{lesson.title}</Text>

        {/* Progress indicator */}
        <Text style={styles.progressText}>
          Lesson {index + 1} of {allLessons.length}
        </Text>

        {/* Content based on type */}
        {lesson.content_type === 'text' && (
          <View style={styles.textContent}>
            {content.body && <Text style={styles.bodyText}>{content.body}</Text>}
            {content.sections?.map((section: any, i: number) => (
              <View key={i} style={styles.textSection}>
                {section.heading && (
                  <Text style={styles.sectionHeading}>{section.heading}</Text>
                )}
                {section.text && (
                  <Text style={styles.sectionText}>{section.text}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {lesson.content_type === 'quiz' && (
          <View style={styles.quizContent}>
            {content.question && (
              <Text style={styles.quizQuestion}>{content.question}</Text>
            )}
            {content.options?.map((option: string, i: number) => (
              <TouchableOpacity key={i} style={styles.quizOption} activeOpacity={0.7}>
                <View style={styles.quizOptionCircle}>
                  <Text style={styles.quizOptionLetter}>
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <Text style={styles.quizOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {lesson.content_type === 'interactive' && (
          <View style={styles.interactiveContent}>
            {content.instructions && (
              <Text style={styles.bodyText}>{content.instructions}</Text>
            )}
            <View style={styles.interactiveArea}>
              <Ionicons name="hand-left-outline" size={32} color={colors.textSecondary} />
              <Text style={styles.interactiveHint}>
                Interactive content area
              </Text>
            </View>
          </View>
        )}

        {lesson.content_type === 'practice' && (
          <View style={styles.practiceContent}>
            {content.prompt && (
              <View style={styles.practicePrompt}>
                <Text style={styles.practiceLabel}>Practice Prompt:</Text>
                <Text style={styles.practicePromptText}>{content.prompt}</Text>
              </View>
            )}
            {content.tips?.map((tip: string, i: number) => (
              <View key={i} style={styles.tipRow}>
                <Ionicons name="bulb-outline" size={16} color={colors.warning} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.completeButton, completing && styles.completeButtonDisabled]}
          onPress={handleComplete}
          disabled={completing}
          activeOpacity={0.7}
        >
          {completing ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={colors.textLight} />
              <Text style={styles.completeButtonText}>Mark Complete</Text>
            </>
          )}
        </TouchableOpacity>
        {index < allLessons.length - 1 && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  typeBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.primary,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  progressText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  // Text content
  textContent: {
    gap: spacing.md,
  },
  bodyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 22,
  },
  textSection: {
    gap: spacing.xs,
  },
  sectionHeading: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  sectionText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 22,
  },
  // Quiz content
  quizContent: {
    gap: spacing.md,
  },
  quizQuestion: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quizOptionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizOptionLetter: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.primary,
  },
  quizOptionText: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
  },
  // Interactive content
  interactiveContent: {
    gap: spacing.lg,
  },
  interactiveArea: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  interactiveHint: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  // Practice content
  practiceContent: {
    gap: spacing.md,
  },
  practicePrompt: {
    padding: spacing.md,
    backgroundColor: colors.primary + '08',
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  practiceLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    color: colors.primary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  practicePromptText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
    lineHeight: 22,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // Action bar
  actionBar: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  completeButtonDisabled: {
    opacity: 0.5,
  },
  completeButtonText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.textLight,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  nextButtonText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.primary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
});

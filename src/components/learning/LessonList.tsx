import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { TutorialLesson, UserTutorialProgress } from '@/services/tutorial.service';

type Props = {
  lessons: TutorialLesson[];
  progress: UserTutorialProgress | null;
  onLessonPress: (lessonIndex: number, lesson: TutorialLesson) => void;
};

const CONTENT_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  text: 'document-text-outline',
  interactive: 'hand-left-outline',
  quiz: 'help-circle-outline',
  practice: 'brush-outline',
};

export function LessonList({ lessons, progress, onLessonPress }: Props) {
  const completedLessons = new Set(progress?.completed_lessons || []);

  return (
    <View style={styles.container}>
      {lessons.map((lesson, index) => {
        const isCompleted = completedLessons.has(index);
        const isCurrent = progress?.current_lesson === index;

        return (
          <TouchableOpacity
            key={lesson.id}
            style={[
              styles.lessonRow,
              isCurrent && styles.lessonRowCurrent,
              index === lessons.length - 1 && styles.lessonRowLast,
            ]}
            onPress={() => onLessonPress(index, lesson)}
            activeOpacity={0.7}
          >
            {/* Status indicator */}
            <View style={[
              styles.statusCircle,
              isCompleted && styles.statusCompleted,
              isCurrent && !isCompleted && styles.statusCurrent,
            ]}>
              {isCompleted ? (
                <Ionicons name="checkmark" size={14} color={colors.textLight} />
              ) : (
                <Text style={[
                  styles.lessonNumber,
                  isCurrent && styles.lessonNumberCurrent,
                ]}>
                  {index + 1}
                </Text>
              )}
            </View>

            {/* Lesson info */}
            <View style={styles.lessonInfo}>
              <Text style={[
                styles.lessonTitle,
                isCompleted && styles.lessonTitleCompleted,
              ]} numberOfLines={1}>
                {lesson.title}
              </Text>
              <View style={styles.lessonMeta}>
                <Ionicons
                  name={CONTENT_TYPE_ICONS[lesson.content_type] || 'document-outline'}
                  size={12}
                  color={colors.textSecondary}
                />
                <Text style={styles.lessonType}>{lesson.content_type}</Text>
                <Text style={styles.lessonXp}>+{lesson.xp_reward} XP</Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  lessonRowCurrent: {
    backgroundColor: colors.primary + '08',
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  lessonRowLast: {
    borderBottomWidth: 0,
  },
  statusCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  statusCurrent: {
    borderColor: colors.primary,
  },
  lessonNumber: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
  },
  lessonNumberCurrent: {
    color: colors.primary,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
    marginBottom: 2,
  },
  lessonTitleCompleted: {
    color: colors.textSecondary,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonType: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  lessonXp: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.warning,
    marginLeft: spacing.sm,
  },
});

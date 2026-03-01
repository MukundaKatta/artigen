import { useState, useEffect, useCallback } from 'react';
import {
  getTutorial,
  getLessons,
  getProgress,
  updateProgress,
  completeTutorial,
} from '@/services/tutorial.service';
import type { Tutorial, TutorialLesson, UserTutorialProgress } from '@/services/tutorial.service';

export function useTutorial(tutorialId: string | undefined, userId: string | undefined) {
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [lessons, setLessons] = useState<TutorialLesson[]>([]);
  const [progress, setProgress] = useState<UserTutorialProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!tutorialId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [tutorialRes, lessonsRes] = await Promise.all([
      getTutorial(tutorialId),
      getLessons(tutorialId),
    ]);

    if (tutorialRes.data) setTutorial(tutorialRes.data);
    setLessons(lessonsRes.data);

    if (userId) {
      const progressRes = await getProgress(userId, tutorialId);
      setProgress(progressRes.data);
    }

    setLoading(false);
  }, [tutorialId, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Start / complete a lesson ──────────────────────

  const startLesson = useCallback(
    async (lessonIndex: number) => {
      if (!userId || !tutorialId) return;
      // Just update current_lesson in progress
      setProgress((prev) =>
        prev ? { ...prev, current_lesson: lessonIndex } : null,
      );
    },
    [userId, tutorialId],
  );

  const completeLesson = useCallback(
    async (lessonIndex: number) => {
      if (!userId || !tutorialId) return;

      // Optimistic update
      setProgress((prev) => {
        if (!prev) {
          return {
            id: '',
            user_id: userId,
            tutorial_id: tutorialId,
            current_lesson: lessonIndex + 1,
            completed_lessons: [lessonIndex],
            is_completed: false,
            started_at: new Date().toISOString(),
            completed_at: null,
          };
        }
        const completedLessons = prev.completed_lessons.includes(lessonIndex)
          ? prev.completed_lessons
          : [...prev.completed_lessons, lessonIndex];
        return {
          ...prev,
          current_lesson: lessonIndex + 1,
          completed_lessons: completedLessons,
        };
      });

      const { data } = await updateProgress(userId, tutorialId, lessonIndex);
      if (data) setProgress(data);

      // Check if all lessons are now completed
      const updatedProgress = data || progress;
      if (updatedProgress && updatedProgress.completed_lessons.length >= lessons.length && lessons.length > 0) {
        const { data: completed } = await completeTutorial(userId, tutorialId);
        if (completed) setProgress(completed);
      }
    },
    [userId, tutorialId, progress, lessons.length],
  );

  return {
    tutorial,
    lessons,
    progress,
    loading,
    startLesson,
    completeLesson,
    refresh: fetchData,
  };
}

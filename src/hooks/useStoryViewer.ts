import { useState, useCallback, useRef, useEffect } from 'react';
import { markStoryViewed } from '@/services/story.service';
import { STORY_DURATION_SECONDS } from '@/lib/constants';
import type { StoryWithUser } from '@/types/database';

export function useStoryViewer(stories: StoryWithUser[], viewerId: string) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const startTimeRef = useRef(Date.now());

  const currentStory = stories[currentIndex] || null;
  const hasNext = currentIndex < stories.length - 1;
  const hasPrev = currentIndex > 0;

  // Mark as viewed when story changes
  useEffect(() => {
    if (currentStory && viewerId) {
      markStoryViewed(currentStory.id, viewerId);
    }
  }, [currentStory?.id, viewerId]);

  // Progress timer
  useEffect(() => {
    if (paused || !currentStory) return;

    const duration = (currentStory.duration_seconds || STORY_DURATION_SECONDS) * 1000;
    const intervalMs = 50;
    startTimeRef.current = Date.now() - progress * duration;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      if (newProgress >= 1) {
        clearInterval(timerRef.current);
        if (hasNext) {
          setCurrentIndex((i) => i + 1);
          setProgress(0);
        }
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, paused, currentStory]);

  const next = useCallback(() => {
    if (hasNext) {
      setCurrentIndex((i) => i + 1);
      setProgress(0);
    }
  }, [hasNext]);

  const prev = useCallback(() => {
    if (hasPrev) {
      setCurrentIndex((i) => i - 1);
      setProgress(0);
    } else {
      // Restart current
      setProgress(0);
      startTimeRef.current = Date.now();
    }
  }, [hasPrev]);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  return {
    currentStory,
    currentIndex,
    progress,
    hasNext,
    hasPrev,
    paused,
    next,
    prev,
    pause,
    resume,
  };
}

import { supabase } from '@/lib/supabase';

// ── Types ────────────────────────────────────────────

export type Tutorial = {
  id: string;
  title: string;
  description: string | null;
  category: 'basics' | 'prompting' | 'styles' | 'advanced' | 'models' | 'composition';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  cover_image_url: string | null;
  estimated_minutes: number;
  xp_reward: number;
  sort_order: number;
  is_published: boolean;
  created_at: string;
};

export type TutorialLesson = {
  id: string;
  tutorial_id: string;
  title: string;
  content_type: 'text' | 'interactive' | 'quiz' | 'practice';
  content: Record<string, any>;
  sort_order: number;
  xp_reward: number;
};

export type UserTutorialProgress = {
  id: string;
  user_id: string;
  tutorial_id: string;
  current_lesson: number;
  completed_lessons: number[];
  is_completed: boolean;
  started_at: string;
  completed_at: string | null;
};

// ── Get tutorials ────────────────────────────────────

export async function getTutorials(category?: string) {
  let query = supabase
    .from('tutorials')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (category) {
    query = query.eq('category', category as 'basics' | 'prompting' | 'styles' | 'advanced' | 'models' | 'composition');
  }

  const { data, error } = await query;
  return { data: (data || []) as unknown as Tutorial[], error };
}

// ── Get single tutorial ──────────────────────────────

export async function getTutorial(id: string) {
  const { data, error } = await supabase
    .from('tutorials')
    .select('*')
    .eq('id', id)
    .single();

  return { data: data as unknown as Tutorial | null, error };
}

// ── Get lessons for a tutorial ───────────────────────

export async function getLessons(tutorialId: string) {
  const { data, error } = await supabase
    .from('tutorial_lessons')
    .select('*')
    .eq('tutorial_id', tutorialId)
    .order('sort_order', { ascending: true });

  return { data: (data || []) as unknown as TutorialLesson[], error };
}

// ── Get progress ─────────────────────────────────────

export async function getProgress(userId: string, tutorialId: string) {
  const { data, error } = await supabase
    .from('user_tutorial_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('tutorial_id', tutorialId)
    .maybeSingle();

  return { data: data as unknown as UserTutorialProgress | null, error };
}

// ── Get all progress for a user ──────────────────────

export async function getAllProgress(userId: string) {
  const { data, error } = await supabase
    .from('user_tutorial_progress')
    .select('*')
    .eq('user_id', userId);

  return { data: (data || []) as unknown as UserTutorialProgress[], error };
}

// ── Update progress (mark a lesson as completed) ─────

export async function updateProgress(userId: string, tutorialId: string, lessonIndex: number) {
  // First check if progress exists
  const { data: existing } = await getProgress(userId, tutorialId);

  if (existing) {
    const completedLessons = existing.completed_lessons.includes(lessonIndex)
      ? existing.completed_lessons
      : [...existing.completed_lessons, lessonIndex];

    const { data, error } = await supabase
      .from('user_tutorial_progress')
      .update({
        current_lesson: lessonIndex + 1,
        completed_lessons: completedLessons,
      } as any)
      .eq('user_id', userId)
      .eq('tutorial_id', tutorialId)
      .select()
      .single();

    return { data: data as unknown as UserTutorialProgress | null, error };
  } else {
    const { data, error } = await supabase
      .from('user_tutorial_progress')
      .insert({
        user_id: userId,
        tutorial_id: tutorialId,
        current_lesson: lessonIndex + 1,
        completed_lessons: [lessonIndex],
      })
      .select()
      .single();

    return { data: data as unknown as UserTutorialProgress | null, error };
  }
}

// ── Complete tutorial ────────────────────────────────

export async function completeTutorial(userId: string, tutorialId: string) {
  const { data, error } = await supabase
    .from('user_tutorial_progress')
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    } as any)
    .eq('user_id', userId)
    .eq('tutorial_id', tutorialId)
    .select()
    .single();

  return { data: data as unknown as UserTutorialProgress | null, error };
}

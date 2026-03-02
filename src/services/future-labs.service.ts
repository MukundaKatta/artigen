import { supabase } from '@/lib/supabase';
import type {
  DirectorModePlan,
  FutureLabsIntent,
  LiveProvenanceSession,
  LocalizationJob,
  SpatialGalleryScene,
} from '@/types/future';

function toError(err: unknown): Error {
  if (err instanceof Error) return err;
  return new Error(typeof err === 'string' ? err : 'Unknown error');
}

export async function submitFutureLabsIntent(intent: FutureLabsIntent) {
  // Phase 1: contract endpoint (optional)
  const { data, error } = await supabase.functions.invoke('future-labs-intent', {
    body: intent,
  });

  if (error) {
    return { data: null, error: toError(error.message || 'Intent submission failed') };
  }

  return { data, error: null };
}

export async function startLiveProvenance(postId: string, streamId: string) {
  const { data, error } = await submitFutureLabsIntent({
    feature: 'live_provenance',
    input: { postId, streamId },
  });
  return { data: data as LiveProvenanceSession | null, error };
}

export async function startLocalization(mediaUrl: string, sourceLanguage: string, targets: string[]) {
  const { data, error } = await submitFutureLabsIntent({
    feature: 'localization_studio',
    input: { mediaUrl, sourceLanguage, targets },
  });
  return { data: data as LocalizationJob | null, error };
}

export async function createSpatialGallery(title: string, postIds: string[]) {
  const { data, error } = await submitFutureLabsIntent({
    feature: 'spatial_gallery',
    input: { title, postIds },
  });
  return { data: data as SpatialGalleryScene | null, error };
}

export async function createDirectorPlan(prompt: string, objective?: string) {
  const { data, error } = await submitFutureLabsIntent({
    feature: 'director_mode',
    input: { prompt, objective },
  });
  return { data: data as DirectorModePlan | null, error };
}

export type LiveProvenanceSession = {
  id: string;
  post_id: string;
  stream_id: string;
  status: 'pending' | 'active' | 'ended' | 'failed';
  c2pa_manifest_url?: string | null;
  created_at: string;
  updated_at?: string;
};

export type LocalizationJob = {
  id: string;
  source_media_url: string;
  source_language: string;
  target_languages: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result_tracks?: Array<{
    language: string;
    audio_url?: string;
    subtitle_url?: string;
  }>;
  created_at: string;
};

export type SpatialGalleryScene = {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  poster_url?: string;
  scene_url?: string;
  created_at: string;
};

export type DirectorModePlan = {
  id: string;
  user_id: string;
  prompt: string;
  objective?: string;
  steps: Array<{
    type: 'generate' | 'restyle' | 'inpaint' | 'outpaint' | 'upscale' | 'caption' | 'publish';
    params: Record<string, unknown>;
  }>;
  status: 'draft' | 'running' | 'completed' | 'failed';
  created_at: string;
};

export type FutureLabsIntent =
  | { feature: 'live_provenance'; input: { postId: string; streamId: string } }
  | { feature: 'localization_studio'; input: { mediaUrl: string; sourceLanguage: string; targets: string[] } }
  | { feature: 'spatial_gallery'; input: { title: string; postIds: string[] } }
  | { feature: 'director_mode'; input: { prompt: string; objective?: string } };

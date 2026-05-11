import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type ExhibitionUpdate = Database['public']['Tables']['exhibitions']['Update'];
type ExhibitionSubmissionUpdate = Database['public']['Tables']['exhibition_submissions']['Update'];

// ── Types ────────────────────────────────────────────

export type Exhibition = {
  id: string;
  title: string;
  description: string | null;
  theme: string | null;
  cover_image_url: string | null;
  curator_id: string;
  status: 'accepting' | 'curating' | 'live' | 'archived';
  max_submissions: number;
  submission_count: number;
  view_count: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

export type ExhibitionWithCurator = Exhibition & {
  curator: { id: string; username: string; avatar_url: string | null };
};

export type ExhibitionSubmission = {
  id: string;
  exhibition_id: string;
  user_id: string;
  post_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'featured';
  curator_note: string | null;
  position: number | null;
  submitted_at: string;
};

export type ExhibitionSubmissionWithDetails = ExhibitionSubmission & {
  user: { id: string; username: string; avatar_url: string | null };
  post: { id: string; media: { media_url: string; media_type: string }[] };
};

// ── Get exhibitions ──────────────────────────────────

export async function getExhibitions(status?: string) {
  let query = supabase
    .from('exhibitions')
    .select('*, curator:profiles!curator_id(id, username, avatar_url)')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status as 'accepting' | 'curating' | 'live' | 'archived');
  }

  const { data, error } = await query;
  return { data: (data || []) as unknown as ExhibitionWithCurator[], error };
}

// ── Get single exhibition ────────────────────────────

export async function getExhibition(id: string) {
  const { data, error } = await supabase
    .from('exhibitions')
    .select('*, curator:profiles!curator_id(id, username, avatar_url)')
    .eq('id', id)
    .single();

  return { data: data as unknown as ExhibitionWithCurator | null, error };
}

// ── Create exhibition ────────────────────────────────

export async function createExhibition(
  curatorId: string,
  title: string,
  description: string,
  theme: string,
) {
  const { data, error } = await supabase
    .from('exhibitions')
    .insert({
      curator_id: curatorId,
      title,
      description: description || null,
      theme: theme || null,
    })
    .select('*, curator:profiles!curator_id(id, username, avatar_url)')
    .single();

  return { data: data as unknown as ExhibitionWithCurator | null, error };
}

// ── Submit to exhibition ─────────────────────────────

export async function submitToExhibition(exhibitionId: string, userId: string, postId: string) {
  const { data, error } = await supabase
    .from('exhibition_submissions')
    .insert({
      exhibition_id: exhibitionId,
      user_id: userId,
      post_id: postId,
    })
    .select('*, user:profiles!user_id(id, username, avatar_url), post:posts!post_id(id, media:post_media(media_url, media_type))')
    .single();

  if (!error) {
    // Increment submission_count
    supabase
      .from('exhibitions')
      .select('submission_count')
      .eq('id', exhibitionId)
      .single()
      .then(({ data: exhibition }) => {
        if (exhibition) {
          const updateData: ExhibitionUpdate = {
            submission_count: (exhibition.submission_count || 0) + 1,
          };

          supabase
            .from('exhibitions')
            .update(updateData)
            .eq('id', exhibitionId)
            .then(() => {});
        }
      });
  }

  return { data: data as unknown as ExhibitionSubmissionWithDetails | null, error };
}

// ── Curate submission ────────────────────────────────

export async function curateSubmission(
  submissionId: string,
  status: 'accepted' | 'rejected' | 'featured',
  note?: string,
) {
  const updateData: ExhibitionSubmissionUpdate = { status };
  if (note) updateData.curator_note = note;

  const { data, error } = await supabase
    .from('exhibition_submissions')
    .update(updateData)
    .eq('id', submissionId)
    .select('*, user:profiles!user_id(id, username, avatar_url), post:posts!post_id(id, media:post_media(media_url, media_type))')
    .single();

  return { data: data as unknown as ExhibitionSubmissionWithDetails | null, error };
}

// ── Get submissions ──────────────────────────────────

export async function getSubmissions(exhibitionId: string) {
  const { data, error } = await supabase
    .from('exhibition_submissions')
    .select('*, user:profiles!user_id(id, username, avatar_url), post:posts!post_id(id, media:post_media(media_url, media_type))')
    .eq('exhibition_id', exhibitionId)
    .order('submitted_at', { ascending: false });

  return { data: (data || []) as unknown as ExhibitionSubmissionWithDetails[], error };
}

// ── Record visit ─────────────────────────────────────

export async function recordVisit(exhibitionId: string, userId: string) {
  const { error } = await supabase
    .from('exhibition_visits')
    .upsert(
      { exhibition_id: exhibitionId, user_id: userId },
      { onConflict: 'exhibition_id,user_id', ignoreDuplicates: true },
    );

  if (!error) {
    // Increment view_count
    supabase
      .from('exhibitions')
      .select('view_count')
      .eq('id', exhibitionId)
      .single()
      .then(({ data }) => {
        if (data) {
          const updateData: ExhibitionUpdate = {
            view_count: (data.view_count || 0) + 1,
          };

          supabase
            .from('exhibitions')
            .update(updateData)
            .eq('id', exhibitionId)
            .then(() => {});
        }
      });
  }

  return { error };
}

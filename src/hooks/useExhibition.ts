import { useState, useEffect, useCallback } from 'react';
import {
  getExhibition,
  getSubmissions,
  submitToExhibition,
  curateSubmission,
  recordVisit,
} from '@/services/exhibition.service';
import type {
  ExhibitionWithCurator,
  ExhibitionSubmissionWithDetails,
} from '@/services/exhibition.service';

export function useExhibition(exhibitionId: string | undefined, userId: string | undefined) {
  const [exhibition, setExhibition] = useState<ExhibitionWithCurator | null>(null);
  const [submissions, setSubmissions] = useState<ExhibitionSubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!exhibitionId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [exhibitionRes, submissionsRes] = await Promise.all([
      getExhibition(exhibitionId),
      getSubmissions(exhibitionId),
    ]);

    if (exhibitionRes.data) setExhibition(exhibitionRes.data);
    setSubmissions(submissionsRes.data);

    // Record visit
    if (userId) {
      recordVisit(exhibitionId, userId);
    }

    setLoading(false);
  }, [exhibitionId, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const submit = useCallback(
    async (postId: string) => {
      if (!exhibitionId || !userId) return { error: new Error('Missing params') };

      const { data, error } = await submitToExhibition(exhibitionId, userId, postId);
      if (data && !error) {
        setSubmissions((prev) => [data, ...prev]);
        setExhibition((prev) =>
          prev ? { ...prev, submission_count: prev.submission_count + 1 } : prev,
        );
      }
      return { data, error };
    },
    [exhibitionId, userId],
  );

  const curate = useCallback(
    async (submissionId: string, status: 'accepted' | 'rejected' | 'featured', note?: string) => {
      const { data, error } = await curateSubmission(submissionId, status, note);
      if (data && !error) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === submissionId ? data : s)),
        );
      }
      return { data, error };
    },
    [],
  );

  const visit = useCallback(async () => {
    if (!exhibitionId || !userId) return;
    await recordVisit(exhibitionId, userId);
  }, [exhibitionId, userId]);

  return {
    exhibition,
    submissions,
    loading,
    submit,
    curate,
    recordVisit: visit,
    refresh: fetchData,
  };
}

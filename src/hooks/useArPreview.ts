import { useState, useEffect, useCallback } from 'react';
import * as arPreviewService from '@/services/ar-preview.service';
import type { ArPreview, FrameStyle } from '@/services/ar-preview.service';

export function useArPreview(postId: string | undefined) {
  const [preview, setPreview] = useState<ArPreview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreview = useCallback(async () => {
    if (!postId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await arPreviewService.getArPreview(postId);
    setPreview(data);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  const create = useCallback(
    async (frameStyle: FrameStyle, widthCm: number, heightCm: number) => {
      if (!postId) return null;
      const { data, error } = await arPreviewService.createArPreview(
        postId,
        frameStyle,
        widthCm,
        heightCm
      );
      if (data && !error) setPreview(data);
      return data;
    },
    [postId]
  );

  const update = useCallback(
    async (updates: { frame_style?: FrameStyle; default_width_cm?: number; default_height_cm?: number }) => {
      if (!postId) return null;
      const { data, error } = await arPreviewService.updateArPreview(postId, updates);
      if (data && !error) setPreview(data);
      return data;
    },
    [postId]
  );

  return {
    preview,
    loading,
    create,
    update,
    refresh: fetchPreview,
  };
}

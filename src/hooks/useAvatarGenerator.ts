import { useState, useCallback, useEffect, useRef } from 'react';
import * as avatarService from '@/services/avatar.service';
import type { AvatarStyle, AvatarGenerationJob, UserAvatar } from '@/services/avatar.service';

export function useAvatarGenerator(userId?: string) {
  const [job, setJob] = useState<AvatarGenerationJob | null>(null);
  const [avatars, setAvatars] = useState<UserAvatar[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAvatars, setLoadingAvatars] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState<AvatarStyle>('anime');
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  // ── Fetch saved avatars ────────────────────────────

  const fetchAvatars = useCallback(async () => {
    if (!userId) return;
    setLoadingAvatars(true);
    const { data } = await avatarService.getMyAvatars(userId);
    setAvatars(data);
    setLoadingAvatars(false);
  }, [userId]);

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  // ── Generate avatars (create job + poll) ───────────

  const generate = useCallback(
    async (sourceImageUrls: string[], promptModifier?: string) => {
      if (!userId) return;
      setLoading(true);

      const { data, error } = await avatarService.createAvatarJob(
        userId,
        sourceImageUrls,
        selectedStyle,
        promptModifier,
      );

      if (data) {
        setJob(data);

        // Clear existing poll
        if (pollRef.current) clearInterval(pollRef.current);

        // Poll every 3 seconds for job completion
        pollRef.current = setInterval(async () => {
          const { data: updated } = await avatarService.getAvatarJob(data.id);
          if (updated) {
            setJob(updated);
            if (updated.status === 'completed' || updated.status === 'failed') {
              clearInterval(pollRef.current);
              setLoading(false);
            }
          }
        }, 3000);
      } else {
        setLoading(false);
      }

      return { data, error };
    },
    [userId, selectedStyle],
  );

  // ── Save an avatar from job results ────────────────

  const saveAvatarFromResult = useCallback(
    async (imageUrl: string) => {
      if (!userId) return;
      const { data } = await avatarService.saveAvatar(userId, imageUrl, selectedStyle);
      if (data) {
        setAvatars((prev) => [data, ...prev]);
      }
      return data;
    },
    [userId, selectedStyle],
  );

  // ── Set an avatar as active (profile picture) ──────

  const setActive = useCallback(
    async (avatarId: string) => {
      if (!userId) return;
      const { data } = await avatarService.setActiveAvatar(userId, avatarId);
      if (data) {
        setAvatars((prev) =>
          prev.map((a) => ({
            ...a,
            is_active: a.id === avatarId,
          })),
        );
      }
      return data;
    },
    [userId],
  );

  // ── Remove a saved avatar ──────────────────────────

  const remove = useCallback(async (avatarId: string) => {
    const { error } = await avatarService.removeAvatar(avatarId);
    if (!error) {
      setAvatars((prev) => prev.filter((a) => a.id !== avatarId));
    }
    return { error };
  }, []);

  // ── Cleanup polling on unmount ─────────────────────

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return {
    job,
    avatars,
    loading,
    loadingAvatars,
    selectedStyle,
    setSelectedStyle,
    generate,
    saveAvatar: saveAvatarFromResult,
    setActive,
    remove,
    fetchAvatars,
  };
}

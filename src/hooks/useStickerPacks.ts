import { useState, useCallback, useEffect } from 'react';
import * as stickerPackService from '@/services/sticker-pack.service';
import type { Profile, StickerPack, UserStickerPack } from '@/types/database';

type StickerPackWithCreator = StickerPack & {
  creator?: Pick<Profile, 'id' | 'username' | 'avatar_url'> | null;
};

type SavedStickerPackResult = StickerPackWithCreator | (UserStickerPack & {
  pack?: StickerPackWithCreator | null;
});

function isSavedPackJoin(row: SavedStickerPackResult): row is UserStickerPack & { pack?: StickerPackWithCreator | null } {
  return 'pack_id' in row;
}

function isStickerPack(pack: StickerPackWithCreator | null | undefined): pack is StickerPackWithCreator {
  return Boolean(pack);
}

export function useStickerPacks(userId?: string) {
  const [packs, setPacks] = useState<StickerPackWithCreator[]>([]);
  const [savedPacks, setSavedPacks] = useState<StickerPackWithCreator[]>([]);
  const [myPacks, setMyPacks] = useState<StickerPack[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPublicPacks = useCallback(async (page: number = 0) => {
    setLoading(true);
    const { data } = await stickerPackService.getPublicPacks(page);
    setPacks((data as unknown as StickerPackWithCreator[] | null) ?? []);
    setLoading(false);
  }, []);

  const fetchSavedPacks = useCallback(async () => {
    if (!userId) return;
    const { data } = await stickerPackService.getSavedPacks(userId);
    const savedRows = (data as unknown as SavedStickerPackResult[] | null) ?? [];
    setSavedPacks(savedRows.map((saved) => isSavedPackJoin(saved) ? saved.pack : saved).filter(isStickerPack));
  }, [userId]);

  const fetchMyPacks = useCallback(async () => {
    if (!userId) return;
    const { data } = await stickerPackService.getMyPacks(userId);
    setMyPacks((data as StickerPack[] | null) ?? []);
  }, [userId]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchPublicPacks(), fetchSavedPacks(), fetchMyPacks()]);
  }, [fetchPublicPacks, fetchSavedPacks, fetchMyPacks]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (name: string, description?: string) => {
      if (!userId) return;
      const { data, error } = await stickerPackService.createPack(userId, name, description);
      if (data) {
        setMyPacks((prev) => [data, ...prev]);
      }
      return { data, error };
    },
    [userId]
  );

  const savePack = useCallback(
    async (packId: string) => {
      if (!userId) return;
      // Optimistic update
      const packToSave = packs.find((p) => p.id === packId);
      if (packToSave) {
        setSavedPacks((prev) => [packToSave, ...prev]);
      }
      const { error } = await stickerPackService.savePack(userId, packId);
      if (error) {
        // Revert on error
        setSavedPacks((prev) => prev.filter((p) => p.id !== packId));
      }
    },
    [userId, packs]
  );

  const unsavePack = useCallback(
    async (packId: string) => {
      if (!userId) return;
      // Optimistic update
      const removed = savedPacks.find((p) => p.id === packId);
      setSavedPacks((prev) => prev.filter((p) => p.id !== packId));
      const { error } = await stickerPackService.unsavePack(userId, packId);
      if (error && removed) {
        // Revert on error
        setSavedPacks((prev) => [removed, ...prev]);
      }
    },
    [userId, savedPacks]
  );

  return { packs, savedPacks, myPacks, loading, create, savePack, unsavePack, refresh };
}

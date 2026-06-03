import { useState, useCallback, useEffect } from 'react';
import {
  getPack,
  getPackStickers,
  addSticker as addStickerSvc,
  removeSticker as removeStickerSvc,
} from '@/services/sticker-pack.service';
import type { Profile, Sticker, StickerPack } from '@/types/database';

type StickerPackWithCreator = StickerPack & {
  creator?: Pick<Profile, 'id' | 'username' | 'avatar_url'> | null;
};

export function useStickerPack(packId?: string) {
  const [pack, setPack] = useState<StickerPackWithCreator | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPack = useCallback(async () => {
    if (!packId) return;
    setLoading(true);
    const [packResult, stickersResult] = await Promise.all([
      getPack(packId),
      getPackStickers(packId),
    ]);
    setPack((packResult.data as unknown as StickerPackWithCreator | null) ?? null);
    setStickers((stickersResult.data as Sticker[] | null) ?? []);
    setLoading(false);
  }, [packId]);

  useEffect(() => {
    fetchPack();
  }, [fetchPack]);

  const addSticker = useCallback(
    async (imageUrl: string, label?: string) => {
      if (!packId) return;
      const { data, error } = await addStickerSvc(packId, imageUrl, label);
      if (data) {
        setStickers((prev) => [...prev, data]);
        setPack((prev) => prev ? { ...prev, sticker_count: (prev.sticker_count ?? 0) + 1 } : prev);
      }
      return { data, error };
    },
    [packId]
  );

  const removeSticker = useCallback(
    async (stickerId: string) => {
      const { error } = await removeStickerSvc(stickerId);
      if (!error) {
        setStickers((prev) => prev.filter((s) => s.id !== stickerId));
        setPack((prev) => prev ? { ...prev, sticker_count: Math.max(0, (prev.sticker_count ?? 1) - 1) } : prev);
      }
      return { error };
    },
    []
  );

  const refresh = useCallback(() => fetchPack(), [fetchPack]);

  return { pack, stickers, loading, addSticker, removeSticker, refresh };
}

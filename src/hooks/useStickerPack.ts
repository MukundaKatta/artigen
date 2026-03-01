import { useState, useCallback, useEffect } from 'react';
import * as stickerPackService from '@/services/sticker-pack.service';

export function useStickerPack(packId?: string) {
  const [pack, setPack] = useState<any>(null);
  const [stickers, setStickers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPack = useCallback(async () => {
    if (!packId) return;
    setLoading(true);
    const [packResult, stickersResult] = await Promise.all([
      stickerPackService.getPack(packId),
      stickerPackService.getPackStickers(packId),
    ]);
    setPack(packResult.data);
    setStickers(stickersResult.data || []);
    setLoading(false);
  }, [packId]);

  useEffect(() => {
    fetchPack();
  }, [fetchPack]);

  const addSticker = useCallback(
    async (imageUrl: string, label?: string) => {
      if (!packId) return;
      const { data, error } = await stickerPackService.addSticker(packId, imageUrl, label);
      if (data) {
        setStickers((prev) => [...prev, data]);
        setPack((prev: any) => prev ? { ...prev, sticker_count: (prev.sticker_count ?? 0) + 1 } : prev);
      }
      return { data, error };
    },
    [packId]
  );

  const removeSticker = useCallback(
    async (stickerId: string) => {
      const { error } = await stickerPackService.removeSticker(stickerId);
      if (!error) {
        setStickers((prev) => prev.filter((s) => s.id !== stickerId));
        setPack((prev: any) => prev ? { ...prev, sticker_count: Math.max(0, (prev.sticker_count ?? 1) - 1) } : prev);
      }
      return { error };
    },
    []
  );

  const refresh = useCallback(() => fetchPack(), [fetchPack]);

  return { pack, stickers, loading, addSticker, removeSticker, refresh };
}

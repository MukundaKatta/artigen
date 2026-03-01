import { useState, useCallback } from 'react';
import {
  createSticker,
  respondToSticker,
  getStoryStickers,
  getStickerResponses,
} from '@/services/sticker.service';
import type { StorySticker, StickerResponse } from '@/types';
import type { StickerType } from '@/services/sticker.service';

export function useStoryStickers(storyId: string | undefined) {
  const [stickers, setStickers] = useState<StorySticker[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStickers = useCallback(async () => {
    if (!storyId) return;
    setLoading(true);
    const { data } = await getStoryStickers(storyId);
    setStickers(data);
    setLoading(false);
  }, [storyId]);

  const addSticker = useCallback(
    async (type: StickerType, config: Record<string, unknown>, posX?: number, posY?: number) => {
      if (!storyId) return null;
      const { data } = await createSticker(storyId, type, config, posX, posY);
      if (data) {
        setStickers((prev) => [...prev, data]);
      }
      return data;
    },
    [storyId]
  );

  const respond = useCallback(
    async (stickerId: string, userId: string, response: Record<string, unknown>) => {
      const { data } = await respondToSticker(stickerId, userId, response);
      return data;
    },
    []
  );

  const getResponses = useCallback(async (stickerId: string) => {
    const { data } = await getStickerResponses(stickerId);
    return data;
  }, []);

  return {
    stickers,
    loading,
    fetchStickers,
    addSticker,
    respond,
    getResponses,
  };
}

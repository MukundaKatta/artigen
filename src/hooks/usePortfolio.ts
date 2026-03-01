import { useState, useEffect, useCallback } from 'react';
import * as portfolioService from '@/services/portfolio.service';
import type { PortfolioSection } from '@/services/portfolio.service';

export function usePortfolio(userId: string | undefined) {
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolioEnabled, setPortfolioEnabled] = useState(false);

  const fetchPortfolio = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await portfolioService.getPortfolio(userId);
    setSections(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const createSection = useCallback(
    async (title: string, description?: string) => {
      if (!userId) return null;
      const { data, error } = await portfolioService.createSection(userId, title, description);
      if (data && !error) {
        setSections((prev) => [...prev, { ...data, items: [] }]);
      }
      return data;
    },
    [userId]
  );

  const deleteSection = useCallback(async (sectionId: string) => {
    const { error } = await portfolioService.deleteSection(sectionId);
    if (!error) {
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
    }
    return { error };
  }, []);

  const addItem = useCallback(
    async (sectionId: string, postId: string, captionOverride?: string) => {
      const { data, error } = await portfolioService.addItem(sectionId, postId, captionOverride);
      if (data && !error) {
        setSections((prev) =>
          prev.map((s) =>
            s.id === sectionId
              ? { ...s, items: [...(s.items || []), data] }
              : s
          )
        );
      }
      return { data, error };
    },
    []
  );

  const removeItem = useCallback(
    async (sectionId: string, itemId: string) => {
      const { error } = await portfolioService.removeItem(itemId);
      if (!error) {
        setSections((prev) =>
          prev.map((s) =>
            s.id === sectionId
              ? { ...s, items: (s.items || []).filter((i) => i.id !== itemId) }
              : s
          )
        );
      }
      return { error };
    },
    []
  );

  const reorderSections = useCallback(
    async (sectionIds: string[]) => {
      if (!userId) return;
      await portfolioService.reorderSections(userId, sectionIds);
      setSections((prev) => {
        const map = new Map(prev.map((s) => [s.id, s]));
        return sectionIds.map((id, i) => ({ ...map.get(id)!, sort_order: i }));
      });
    },
    [userId]
  );

  const enablePortfolio = useCallback(
    async (bio?: string, contactEmail?: string) => {
      if (!userId) return;
      const { error } = await portfolioService.enablePortfolio(userId, bio, contactEmail);
      if (!error) setPortfolioEnabled(true);
    },
    [userId]
  );

  const disablePortfolio = useCallback(
    async () => {
      if (!userId) return;
      const { error } = await portfolioService.disablePortfolio(userId);
      if (!error) setPortfolioEnabled(false);
    },
    [userId]
  );

  return {
    sections,
    loading,
    portfolioEnabled,
    setPortfolioEnabled,
    createSection,
    deleteSection,
    addItem,
    removeItem,
    reorderSections,
    enablePortfolio,
    disablePortfolio,
    refresh: fetchPortfolio,
  };
}

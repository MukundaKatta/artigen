import { useState, useEffect, useCallback } from 'react';
import {
  getCollections,
  createCollection,
  deleteCollection,
  savePostToCollection,
} from '@/services/collection.service';
import type { Collection } from '@/types';

export function useCollections(userId: string | undefined) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollections = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await getCollections(userId);
    setCollections(data);
    setLoading(false);
  }, [userId]);

  const addCollection = useCallback(
    async (name: string) => {
      if (!userId) return null;
      const { data, error } = await createCollection(userId, name);
      if (data && !error) {
        setCollections((prev) => [data, ...prev]);
      }
      return data;
    },
    [userId]
  );

  const removeCollection = useCallback(async (collectionId: string) => {
    const { error } = await deleteCollection(collectionId);
    if (!error) {
      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
    }
    return { error };
  }, []);

  const saveToCollection = useCallback(
    async (postId: string, collectionId: string | null) => {
      if (!userId) return;
      await savePostToCollection(userId, postId, collectionId);
      await fetchCollections(); // Refresh counts
    },
    [userId, fetchCollections]
  );

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return {
    collections,
    loading,
    addCollection,
    removeCollection,
    saveToCollection,
    refresh: fetchCollections,
  };
}

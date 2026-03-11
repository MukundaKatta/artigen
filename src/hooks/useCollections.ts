import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchCollections = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await getCollections(userId);
      if (!mountedRef.current) return;
      setCollections(data);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load collections');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
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
    error,
    addCollection,
    removeCollection,
    saveToCollection,
    refresh: fetchCollections,
  };
}

import { useState, useEffect, useCallback } from 'react';
import { connectAccount, crossPost, disconnectAccount, getAccounts, getCrossPostStatus } from '@/services/cross-post.service';
import type { CrossPostAccount, CrossPost } from '@/services/cross-post.service';

export function useCrossPost(userId: string | undefined) {
  const [accounts, setAccounts] = useState<CrossPostAccount[]>([]);
  const [crossPosts, setCrossPosts] = useState<CrossPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await getAccounts(userId);
    setAccounts(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const connect = useCallback(
    async (platform: string, username: string) => {
      if (!userId) return null;
      const { data, error } = await connectAccount(userId, platform, username);
      if (data && !error) {
        setAccounts((prev) => {
          const existing = prev.findIndex((a) => a.platform === platform);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = data;
            return updated;
          }
          return [...prev, data];
        });
      }
      return data;
    },
    [userId]
  );

  const disconnect = useCallback(async (accountId: string) => {
    const { error } = await disconnectAccount(accountId);
    if (!error) {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === accountId ? { ...a, is_connected: false } : a
        )
      );
    }
    return { error };
  }, []);

  const doCrossPost = useCallback(
    async (postId: string, platforms: string[]) => {
      if (!userId) return { data: [], error: new Error('Not authenticated') };
      const { data, error } = await crossPost(postId, userId, platforms);
      if (data && !error) {
        setCrossPosts((prev) => [...data, ...prev]);
      }
      return { data, error };
    },
    [userId]
  );

  const fetchCrossPostStatus = useCallback(async (postId: string) => {
    const { data } = await getCrossPostStatus(postId);
    setCrossPosts(data);
    return data;
  }, []);

  const refresh = useCallback(async () => {
    await fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    crossPosts,
    loading,
    connect,
    disconnect,
    crossPost: doCrossPost,
    fetchCrossPostStatus,
    refresh,
  };
}

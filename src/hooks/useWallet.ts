import { useState, useCallback, useEffect } from 'react';
import { getTransactions, getWallet } from '@/services/wallet.service';

export function useWallet(userId?: string) {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWallet = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await getWallet(userId);
    setWallet(data);
    setLoading(false);
  }, [userId]);

  const fetchTransactions = useCallback(async (page = 0) => {
    if (!wallet?.id) return;
    const { data } = await getTransactions(wallet.id, page);
    if (page === 0) setTransactions(data || []);
    else setTransactions(prev => [...prev, ...(data || [])]);
  }, [wallet?.id]);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);
  useEffect(() => { if (wallet) fetchTransactions(); }, [wallet, fetchTransactions]);

  return {
    wallet,
    transactions,
    loading,
    balanceCents: wallet?.balance_cents || 0,
    refresh: fetchWallet,
    loadMore: (page: number) => fetchTransactions(page),
  };
}

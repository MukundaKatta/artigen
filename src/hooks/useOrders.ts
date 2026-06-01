import { useState, useCallback, useEffect } from 'react';
import { getMyOrders, getMySales } from '@/services/order.service';

export function useOrders(userId?: string, mode: 'buyer' | 'seller' = 'buyer') {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = mode === 'buyer'
      ? await getMyOrders(userId)
      : await getMySales(userId);
    setOrders(data || []);
    setLoading(false);
  }, [userId, mode]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return { orders, loading, refresh: fetchOrders };
}

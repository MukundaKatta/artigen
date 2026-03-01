import { useState, useCallback, useEffect } from 'react';
import * as marketplaceService from '@/services/marketplace.service';

export function useMarketplace(sellerId?: string) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchListings = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
    const { data } = await marketplaceService.getListingsForSeller(sellerId);
    setListings(data || []);
    setLoading(false);
  }, [sellerId]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const search = useCallback(async (query?: string, page = 0) => {
    const { data, error } = await marketplaceService.searchListings(query, page);
    return { data: data || [], error };
  }, []);

  return { listings, loading, search, refresh: fetchListings };
}

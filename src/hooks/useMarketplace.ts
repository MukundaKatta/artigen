import { useState, useCallback, useEffect, useRef } from 'react';
import * as marketplaceService from '@/services/marketplace.service';

type SellerListing = NonNullable<Awaited<ReturnType<typeof marketplaceService.getListingsForSeller>>['data']>[number];

export function useMarketplace(sellerId?: string) {
  const [listings, setListings] = useState<SellerListing[]>([]);
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

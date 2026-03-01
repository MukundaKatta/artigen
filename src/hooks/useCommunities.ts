import { useState, useEffect, useCallback } from 'react';
import {
  getUserCommunities,
  discoverCommunities,
  searchCommunities,
} from '@/services/community.service';
import type { Community } from '@/types';

export function useCommunities(userId: string | undefined) {
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [discover, setDiscover] = useState<Community[]>([]);
  const [searchResults, setSearchResults] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [discoverPage, setDiscoverPage] = useState(0);
  const [hasMoreDiscover, setHasMoreDiscover] = useState(true);

  const fetchUserCommunities = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await getUserCommunities(userId);
    setUserCommunities(data);
    setLoading(false);
  }, [userId]);

  const fetchDiscover = useCallback(async (page = 0) => {
    setDiscoverLoading(true);
    const { data } = await discoverCommunities(page);
    if (page === 0) {
      setDiscover(data);
    } else {
      setDiscover((prev) => [...prev, ...data]);
    }
    setHasMoreDiscover(data.length === 20);
    setDiscoverLoading(false);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const { data } = await searchCommunities(query);
    setSearchResults(data);
  }, []);

  useEffect(() => {
    fetchUserCommunities();
    fetchDiscover(0);
  }, [fetchUserCommunities, fetchDiscover]);

  const loadMoreDiscover = useCallback(() => {
    if (!hasMoreDiscover || discoverLoading) return;
    const next = discoverPage + 1;
    setDiscoverPage(next);
    fetchDiscover(next);
  }, [discoverPage, hasMoreDiscover, discoverLoading, fetchDiscover]);

  return {
    userCommunities,
    discover,
    searchResults,
    loading,
    discoverLoading,
    searchQuery,
    hasMoreDiscover,
    setSearchQuery: handleSearch,
    loadMoreDiscover,
    refresh: fetchUserCommunities,
  };
}

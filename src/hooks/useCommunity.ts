import { useState, useEffect, useCallback } from 'react';
import {
  getCommunity,
  getMembers,
  getCommunityFeed,
  joinCommunity,
  leaveCommunity,
  checkMembership,
} from '@/services/community.service';
import type { Community, CommunityMember, PostWithUser } from '@/types';

type MemberWithUser = CommunityMember & {
  user: { id: string; username: string; full_name: string; avatar_url: string | null; is_verified: boolean };
};

export function useCommunity(communityId: string | undefined, currentUserId: string | undefined) {
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [feed, setFeed] = useState<PostWithUser[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [role, setRole] = useState<CommunityMember['role'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedPage, setFeedPage] = useState(0);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);
  const [joining, setJoining] = useState(false);

  const fetchCommunity = useCallback(async () => {
    if (!communityId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [communityRes, membersRes] = await Promise.all([
      getCommunity(communityId),
      getMembers(communityId, 0),
    ]);
    if (communityRes.data) setCommunity(communityRes.data);
    setMembers(membersRes.data);
    setLoading(false);
  }, [communityId]);

  const fetchFeed = useCallback(async (page = 0) => {
    if (!communityId) return;
    setFeedLoading(true);
    const { data } = await getCommunityFeed(communityId, page);
    if (page === 0) {
      setFeed(data);
    } else {
      setFeed((prev) => [...prev, ...data]);
    }
    setHasMoreFeed(data.length === 20);
    setFeedLoading(false);
  }, [communityId]);

  const fetchMembership = useCallback(async () => {
    if (!communityId || !currentUserId) return;
    const result = await checkMembership(communityId, currentUserId);
    setIsMember(result.isMember);
    setRole(result.role);
  }, [communityId, currentUserId]);

  useEffect(() => {
    setFeedPage(0);
    fetchCommunity();
    fetchFeed(0);
    fetchMembership();
  }, [fetchCommunity, fetchFeed, fetchMembership]);

  const loadMoreFeed = useCallback(() => {
    if (!hasMoreFeed || feedLoading) return;
    const next = feedPage + 1;
    setFeedPage(next);
    fetchFeed(next);
  }, [feedPage, hasMoreFeed, feedLoading, fetchFeed]);

  const toggleJoin = useCallback(async () => {
    if (!communityId || !currentUserId || joining) return;
    setJoining(true);

    const wasMember = isMember;
    // Optimistic update
    setIsMember(!wasMember);
    setCommunity((prev) =>
      prev
        ? { ...prev, member_count: prev.member_count + (wasMember ? -1 : 1) }
        : prev
    );

    const { error } = wasMember
      ? await leaveCommunity(communityId, currentUserId)
      : await joinCommunity(communityId, currentUserId);

    if (error) {
      // Revert
      setIsMember(wasMember);
      setCommunity((prev) =>
        prev
          ? { ...prev, member_count: prev.member_count + (wasMember ? 1 : -1) }
          : prev
      );
    } else {
      setRole(wasMember ? null : 'member');
    }
    setJoining(false);
  }, [communityId, currentUserId, isMember, joining]);

  return {
    community,
    members,
    feed,
    isMember,
    role,
    loading,
    feedLoading,
    hasMoreFeed,
    joining,
    loadMoreFeed,
    toggleJoin,
    refresh: fetchCommunity,
  };
}

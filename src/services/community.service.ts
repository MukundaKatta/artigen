import { supabase } from '@/lib/supabase';
import type { Community, CommunityMember, PostWithUser } from '@/types';

const PAGE_SIZE = 20;

// ── Create ──────────────────────────────────────────

type CreateCommunityParams = {
  name: string;
  description?: string;
  avatar_url?: string;
  cover_url?: string;
  owner_id: string;
  is_private?: boolean;
  rules?: string[];
  tags?: string[];
};

export async function createCommunity(params: CreateCommunityParams) {
  const { data, error } = await supabase
    .from('communities')
    .insert({
      name: params.name,
      description: params.description || null,
      avatar_url: params.avatar_url || null,
      cover_url: params.cover_url || null,
      owner_id: params.owner_id,
      is_private: params.is_private || false,
      rules: params.rules || [],
      tags: params.tags || [],
    })
    .select()
    .single();

  if (data && !error) {
    // Add owner as a member with 'owner' role
    await supabase.from('community_members').insert({
      community_id: data.id,
      user_id: params.owner_id,
      role: 'owner',
    });
  }

  return { data: data as unknown as Community | null, error };
}

// ── Read ────────────────────────────────────────────

export async function getCommunity(id: string) {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('id', id)
    .single();

  return { data: data as unknown as Community | null, error };
}

export async function getMembers(communityId: string, page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('community_members')
    .select('*, user:profiles!user_id(id, username, full_name, avatar_url, is_verified)')
    .eq('community_id', communityId)
    .order('joined_at', { ascending: true })
    .range(from, to);

  return {
    data: (data || []) as unknown as (CommunityMember & {
      user: { id: string; username: string; full_name: string; avatar_url: string | null; is_verified: boolean };
    })[],
    error,
  };
}

export async function getCommunityFeed(communityId: string, page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('posts')
    .select('*, user:profiles!user_id(*), media:post_media(*)')
    .eq('community_id', communityId)
    .eq('is_archived', false)
    .eq('is_draft', false)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: (data || []) as unknown as PostWithUser[], error };
}

export async function getUserCommunities(userId: string) {
  const { data, error } = await supabase
    .from('community_members')
    .select('community:communities!community_id(*)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  const communities = (data || []).map((row: any) => row.community).filter(Boolean);
  return { data: communities as unknown as Community[], error };
}

export async function discoverCommunities(page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('is_private', false)
    .order('member_count', { ascending: false })
    .range(from, to);

  return { data: (data || []) as unknown as Community[], error };
}

export async function searchCommunities(query: string) {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('is_private', false)
    .ilike('name', `%${query}%`)
    .order('member_count', { ascending: false })
    .limit(30);

  return { data: (data || []) as unknown as Community[], error };
}

// ── Join / Leave ────────────────────────────────────

export async function joinCommunity(communityId: string, userId: string) {
  const { error } = await supabase
    .from('community_members')
    .insert({ community_id: communityId, user_id: userId, role: 'member' });

  if (!error) {
    // Increment member_count
    supabase
      .from('communities')
      .select('member_count')
      .eq('id', communityId)
      .single()
      .then(({ data }) => {
        if (data) {
          supabase
            .from('communities')
            .update({ member_count: (data.member_count || 0) + 1 } as any)
            .eq('id', communityId)
            .then(() => {});
        }
      });
  }

  return { error };
}

export async function leaveCommunity(communityId: string, userId: string) {
  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', userId);

  if (!error) {
    // Decrement member_count
    supabase
      .from('communities')
      .select('member_count')
      .eq('id', communityId)
      .single()
      .then(({ data }) => {
        if (data) {
          supabase
            .from('communities')
            .update({ member_count: Math.max(0, (data.member_count || 1) - 1) } as any)
            .eq('id', communityId)
            .then(() => {});
        }
      });
  }

  return { error };
}

// ── Membership check ────────────────────────────────

export async function getCommunityBySlug(slug: string) {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('name', slug)
    .single();
  return { data: data as unknown as Community | null, error };
}

export async function addPostToCommunity(communityId: string, postId: string, userId: string) {
  const { error } = await supabase
    .from('community_posts')
    .insert({ community_id: communityId, post_id: postId, posted_by: userId });
  return { error };
}

export async function updateMemberRole(communityId: string, userId: string, role: 'member' | 'moderator' | 'owner') {
  const { error } = await supabase
    .from('community_members')
    .update({ role })
    .eq('community_id', communityId)
    .eq('user_id', userId);
  return { error };
}

export async function checkMembership(communityId: string, userId: string) {
  const { data } = await supabase
    .from('community_members')
    .select('id, role')
    .eq('community_id', communityId)
    .eq('user_id', userId)
    .maybeSingle();

  return {
    isMember: !!data,
    role: (data?.role as CommunityMember['role']) || null,
  };
}

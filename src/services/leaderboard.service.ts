import { supabase } from '@/lib/supabase';

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time';

export type LeaderboardEntry = {
  rank: number;
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string;
  is_verified: boolean;
  posts_count: number;
  followers_count: number;
  score: number;
  award_count: number;
};

export async function getLeaderboard(
  period: LeaderboardPeriod,
  limit = 50
): Promise<{ data: LeaderboardEntry[] }> {
  // For simplicity, we use profiles table data as a proxy.
  // weekly: order by posts_count (recent activity proxy)
  // monthly: order by followers_count (engagement proxy)
  // all_time: order by followers_count + posts_count combined

  let query = supabase
    .from('profiles')
    .select('id, username, avatar_url, full_name, is_verified, posts_count, followers_count')
    .gt('posts_count', 0)
    .limit(limit);

  if (period === 'weekly') {
    // Weekly: prioritize recent posters, sorted by posts_count
    query = query.order('posts_count', { ascending: false });
  } else if (period === 'monthly') {
    // Monthly: sorted by followers_count
    query = query.order('followers_count', { ascending: false });
  } else {
    // All time: sorted by followers_count (biggest overall creators)
    query = query.order('followers_count', { ascending: false });
  }

  const { data: profiles } = await query;
  const raw = (profiles || []) as unknown as {
    id: string;
    username: string;
    avatar_url: string | null;
    full_name: string;
    is_verified: boolean;
    posts_count: number;
    followers_count: number;
  }[];

  // Get award counts for these users by querying awards given by each user
  const userIds = raw.map((p) => p.id);
  const awardCounts = new Map<string, number>();

  if (userIds.length > 0) {
    // Get awards received: query post_awards joined with posts to get the post owner
    const { data: postsData } = await supabase
      .from('posts')
      .select('id, user_id')
      .in('user_id', userIds);

    const postsList = (postsData || []) as unknown as { id: string; user_id: string }[];
    const postIds = postsList.map((p) => p.id);
    const postOwnerMap = new Map<string, string>();
    postsList.forEach((p) => postOwnerMap.set(p.id, p.user_id));

    if (postIds.length > 0) {
      const { data: awardData } = await supabase
        .from('post_awards')
        .select('post_id')
        .in('post_id', postIds);

      const rawAwards = (awardData || []) as unknown as { post_id: string }[];
      rawAwards.forEach((a) => {
        const ownerId = postOwnerMap.get(a.post_id);
        if (ownerId) {
          awardCounts.set(ownerId, (awardCounts.get(ownerId) || 0) + 1);
        }
      });
    }
  }

  // Compute score and rank
  const entries: LeaderboardEntry[] = raw.map((p, index) => {
    const ac = awardCounts.get(p.id) || 0;
    let score: number;

    if (period === 'weekly') {
      score = p.posts_count * 10 + p.followers_count + ac * 5;
    } else if (period === 'monthly') {
      score = p.followers_count * 2 + p.posts_count * 5 + ac * 10;
    } else {
      score = p.followers_count + p.posts_count * 3 + ac * 15;
    }

    return {
      rank: index + 1,
      id: p.id,
      username: p.username,
      avatar_url: p.avatar_url,
      full_name: p.full_name,
      is_verified: p.is_verified,
      posts_count: p.posts_count,
      followers_count: p.followers_count,
      score,
      award_count: ac,
    };
  });

  // Re-sort by computed score
  entries.sort((a, b) => b.score - a.score);
  entries.forEach((e, i) => (e.rank = i + 1));

  return { data: entries };
}

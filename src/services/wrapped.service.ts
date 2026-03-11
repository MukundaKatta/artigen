import { supabase } from '@/lib/supabase';

export type WrappedStats = {
  year: number;
  totalPosts: number;
  totalLikes: number;
  totalViews: number;
  totalRemixes: number;
  topStyle: string;
  topModel: string;
  topPost: { id: string; mediaUrl: string; likesCount: number } | null;
  creationsByMonth: number[];
  longestStreak: number;
  uniqueStyles: number;
  communitiesJoined: number;
  badgesEarned: number;
  topCollaborator: { id: string; username: string; avatar: string } | null;
  percentileRank: number; // top X% of creators
  totalGenerations: number;
  favoriteTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  artPersonality: string; // e.g. "The Visionary", "The Explorer", "The Perfectionist"
};

const ART_PERSONALITIES: Record<string, { name: string; description: string }> = {
  visionary: { name: 'The Visionary', description: 'You push boundaries and explore new frontiers of AI art.' },
  explorer: { name: 'The Explorer', description: 'You love trying every style and model available.' },
  perfectionist: { name: 'The Perfectionist', description: 'Quality over quantity — every piece is a masterpiece.' },
  socialButterfly: { name: 'The Social Butterfly', description: 'You thrive on community and collaboration.' },
  streaker: { name: 'The Consistent Creator', description: 'Your dedication is unmatched — you create every day.' },
  remixer: { name: 'The Remixer', description: 'You see potential in others\' work and elevate it.' },
  teacher: { name: 'The Mentor', description: 'You inspire others through critiques and tutorials.' },
};

function determinePersonality(stats: Partial<WrappedStats>): string {
  const { longestStreak = 0, totalRemixes = 0, uniqueStyles = 0, communitiesJoined = 0, totalPosts = 0 } = stats;

  if (longestStreak > 30) return ART_PERSONALITIES.streaker.name;
  if (totalRemixes > totalPosts * 0.3) return ART_PERSONALITIES.remixer.name;
  if (uniqueStyles > 10) return ART_PERSONALITIES.explorer.name;
  if (communitiesJoined > 5) return ART_PERSONALITIES.socialButterfly.name;
  if (totalPosts > 0 && totalPosts < 20) return ART_PERSONALITIES.perfectionist.name;
  return ART_PERSONALITIES.visionary.name;
}

async function fetchTopCollaborator(
  userId: string,
  startDate: string,
  endDate: string
): Promise<WrappedStats['topCollaborator']> {
  // Find users who collaborated on the current user's posts this year
  const { data: collabs } = await supabase
    .from('post_collaborators')
    .select('user_id, post:posts!inner(user_id, created_at)')
    .eq('status', 'accepted')
    .eq('posts.user_id', userId)
    .gte('posts.created_at', startDate)
    .lt('posts.created_at', endDate);

  // Also find posts where the user was a collaborator on someone else's post
  const { data: reverseCollabs } = await supabase
    .from('post_collaborators')
    .select('post:posts!inner(user_id, created_at)')
    .eq('user_id', userId)
    .eq('status', 'accepted')
    .gte('posts.created_at', startDate)
    .lt('posts.created_at', endDate);

  // Count collaborations per user
  const collabCounts: Record<string, number> = {};
  type CollabRow = { user_id: string; post: { user_id: string; created_at: string } };
  type ReverseCollabRow = { post: { user_id: string; created_at: string } };

  ((collabs || []) as CollabRow[]).forEach((c) => {
    const uid = c.user_id;
    if (uid && uid !== userId) {
      collabCounts[uid] = (collabCounts[uid] || 0) + 1;
    }
  });
  ((reverseCollabs || []) as ReverseCollabRow[]).forEach((c) => {
    const uid = c.post?.user_id;
    if (uid && uid !== userId) {
      collabCounts[uid] = (collabCounts[uid] || 0) + 1;
    }
  });

  const topEntry = Object.entries(collabCounts).sort((a, b) => b[1] - a[1])[0];
  if (!topEntry) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('id', topEntry[0])
    .single();

  if (!profile) return null;

  type ProfileRow = { id: string; username: string | null; avatar_url: string | null };
  const p = profile as unknown as ProfileRow;
  return {
    id: p.id,
    username: p.username || 'Unknown',
    avatar: p.avatar_url || '',
  };
}

export async function fetchWrappedStats(userId: string, year: number): Promise<WrappedStats> {
  const startDate = `${year}-01-01T00:00:00Z`;
  const endDate = `${year + 1}-01-01T00:00:00Z`;

  type PostRow = {
    id: string;
    created_at: string;
    likes_count: number;
    views_count: number;
    ai_model: string | null;
    ai_style: string | null;
    media: { media_url: string }[];
  };

  // Fetch posts for the year
  const { data: posts } = await supabase
    .from('posts')
    .select('id, created_at, likes_count, views_count, ai_model, ai_style, media:post_media(media_url)')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lt('created_at', endDate)
    .order('likes_count', { ascending: false });

  const allPosts = (posts || []) as PostRow[];
  const totalPosts = allPosts.length;
  const totalLikes = allPosts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
  const totalViews = allPosts.reduce((sum, p) => sum + (p.views_count || 0), 0);

  // Count styles
  const styleCounts: Record<string, number> = {};
  const modelCounts: Record<string, number> = {};
  const hourCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };

  allPosts.forEach((p) => {
    if (p.ai_style) styleCounts[p.ai_style] = (styleCounts[p.ai_style] || 0) + 1;
    if (p.ai_model) modelCounts[p.ai_model] = (modelCounts[p.ai_model] || 0) + 1;

    const hour = new Date(p.created_at).getHours();
    if (hour >= 5 && hour < 12) hourCounts.morning++;
    else if (hour >= 12 && hour < 17) hourCounts.afternoon++;
    else if (hour >= 17 && hour < 21) hourCounts.evening++;
    else hourCounts.night++;
  });

  const topStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  const topModel = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  const favoriteTimeOfDay = (Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'evening') as WrappedStats['favoriteTimeOfDay'];

  // Monthly breakdown
  const creationsByMonth = Array(12).fill(0);
  allPosts.forEach((p) => {
    const month = new Date(p.created_at).getMonth();
    creationsByMonth[month]++;
  });

  // Top post
  const topPostData = allPosts[0];
  const topPost = topPostData
    ? {
        id: topPostData.id,
        mediaUrl: (topPostData.media as { media_url: string }[])?.[0]?.media_url || '',
        likesCount: topPostData.likes_count || 0,
      }
    : null;

  // Fetch remix count
  const { count: remixCount } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('remix_of', 'is', null)
    .gte('created_at', startDate)
    .lt('created_at', endDate);

  // Fetch badges earned this year
  const { count: badgesCount } = await supabase
    .from('user_badges')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('earned_at', startDate)
    .lt('earned_at', endDate);

  // Fetch communities joined
  const { count: communitiesCount } = await supabase
    .from('community_members')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('joined_at', startDate)
    .lt('joined_at', endDate);

  // Fetch streak data
  const { data: streakData } = await supabase
    .from('streaks')
    .select('longest_streak')
    .eq('user_id', userId)
    .single();

  // Calculate percentile (simplified)
  const { count: totalUsers } = await supabase
    .from('posts')
    .select('user_id', { count: 'exact', head: true })
    .gte('created_at', startDate)
    .lt('created_at', endDate);

  const { count: usersWithMorePosts } = await supabase
    .from('posts')
    .select('user_id', { count: 'exact', head: true })
    .gte('created_at', startDate)
    .lt('created_at', endDate)
    .gt('likes_count', totalLikes);

  const percentileRank = totalUsers ? Math.max(1, Math.round(((usersWithMorePosts || 0) / totalUsers) * 100)) : 50;

  const stats: WrappedStats = {
    year,
    totalPosts,
    totalLikes,
    totalViews,
    totalRemixes: remixCount || 0,
    topStyle,
    topModel,
    topPost,
    creationsByMonth,
    longestStreak: streakData?.longest_streak || 0,
    uniqueStyles: Object.keys(styleCounts).length,
    communitiesJoined: communitiesCount || 0,
    badgesEarned: badgesCount || 0,
    topCollaborator: await fetchTopCollaborator(userId, startDate, endDate),
    percentileRank,
    totalGenerations: totalPosts, // Simplified
    favoriteTimeOfDay,
    artPersonality: determinePersonality({
      longestStreak: streakData?.longest_streak || 0,
      totalRemixes: remixCount || 0,
      uniqueStyles: Object.keys(styleCounts).length,
      communitiesJoined: communitiesCount || 0,
      totalPosts,
    }),
  };

  return stats;
}

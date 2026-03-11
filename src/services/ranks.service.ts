import { supabase } from '@/lib/supabase';

export type Rank = {
  level: number;
  name: string;
  icon: string;
  minXp: number;
  maxXp: number;
  color: string;
  perks: string[];
};

export type UserRank = {
  currentRank: Rank;
  nextRank: Rank | null;
  totalXp: number;
  xpToNextRank: number;
  progressPercent: number;
  rankHistory: { rank: string; achievedAt: string }[];
};

export const RANKS: Rank[] = [
  {
    level: 1,
    name: 'Apprentice',
    icon: 'leaf',
    minXp: 0,
    maxXp: 100,
    color: '#9CA3AF',
    perks: ['Basic generation', 'Community access'],
  },
  {
    level: 2,
    name: 'Artisan',
    icon: 'brush',
    minXp: 100,
    maxXp: 500,
    color: '#10B981',
    perks: ['All styles unlocked', 'Remix ability'],
  },
  {
    level: 3,
    name: 'Creator',
    icon: 'color-palette',
    minXp: 500,
    maxXp: 1500,
    color: '#3B82F6',
    perks: ['HD upscaling', 'Priority generation', 'Custom watermarks'],
  },
  {
    level: 4,
    name: 'Visionary',
    icon: 'eye',
    minXp: 1500,
    maxXp: 5000,
    color: '#8B5CF6',
    perks: ['ControlNet access', 'Batch generation', 'Profile badge'],
  },
  {
    level: 5,
    name: 'Master',
    icon: 'star',
    minXp: 5000,
    maxXp: 15000,
    color: '#F59E0B',
    perks: ['Workflow builder', 'API access', 'Featured artist eligibility'],
  },
  {
    level: 6,
    name: 'Grandmaster',
    icon: 'diamond',
    minXp: 15000,
    maxXp: 50000,
    color: '#EF4444',
    perks: ['Unlimited generation', 'Mentor status', 'Revenue sharing'],
  },
  {
    level: 7,
    name: 'Legend',
    icon: 'trophy',
    minXp: 50000,
    maxXp: Infinity,
    color: '#FFD700',
    perks: ['Everything + Custom AI model training', 'Exclusive events', 'Legend badge'],
  },
];

export function getRankForXp(xp: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) return RANKS[i];
  }
  return RANKS[0];
}

export function getNextRank(currentRank: Rank): Rank | null {
  const idx = RANKS.findIndex((r) => r.level === currentRank.level);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

export async function fetchUserRank(userId: string): Promise<UserRank> {
  // Get total XP
  const { data: xpData } = await supabase
    .from('user_xp')
    .select('total_xp')
    .eq('user_id', userId)
    .single();

  const totalXp = xpData?.total_xp || 0;
  const currentRank = getRankForXp(totalXp);
  const nextRank = getNextRank(currentRank);

  const xpInCurrentRank = totalXp - currentRank.minXp;
  const xpRangeForRank = (nextRank?.minXp || currentRank.maxXp) - currentRank.minXp;
  const progressPercent = Math.min(100, Math.round((xpInCurrentRank / xpRangeForRank) * 100));
  const xpToNextRank = nextRank ? nextRank.minXp - totalXp : 0;

  // Get rank history
  const { data: history } = await supabase
    .from('rank_history')
    .select('rank_name, achieved_at')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: true });

  return {
    currentRank,
    nextRank,
    totalXp,
    xpToNextRank,
    progressPercent,
    rankHistory: ((history || []) as { rank_name: string; achieved_at: string }[]).map((h) => ({
      rank: h.rank_name,
      achievedAt: h.achieved_at,
    })),
  };
}

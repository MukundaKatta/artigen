import { supabase } from '@/lib/supabase';

export type StylePhase = {
  month: string; // "2025-01"
  dominantStyle: string;
  dominantModel: string;
  postCount: number;
  avgLikes: number;
  topPostUrl: string | null;
  styles: Record<string, number>;
};

export type StyleEvolution = {
  phases: StylePhase[];
  totalStylesExplored: number;
  currentFavorite: string;
  styleJourney: string; // narrative description
  growthRate: number; // % improvement in engagement over time
};

export async function fetchStyleEvolution(userId: string): Promise<StyleEvolution> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  type PostRow = {
    id: string;
    created_at: string;
    ai_style: string | null;
    ai_model: string | null;
    likes_count: number;
    media: { media_url: string }[];
  };

  const { data: posts } = await supabase
    .from('posts')
    .select('id, created_at, ai_style, ai_model, likes_count, media:post_media(media_url)')
    .eq('user_id', userId)
    .gte('created_at', sixMonthsAgo.toISOString())
    .order('created_at', { ascending: true });

  const allPosts = (posts || []) as unknown as PostRow[];
  const monthlyData: Record<string, { styles: Record<string, number>; models: Record<string, number>; likes: number[]; topPost: { url: string; likes: number } | null }> = {};

  allPosts.forEach((post) => {
    const month = post.created_at.substring(0, 7); // "2025-01"
    if (!monthlyData[month]) {
      monthlyData[month] = { styles: {}, models: {}, likes: [], topPost: null };
    }
    const m = monthlyData[month];

    if (post.ai_style) m.styles[post.ai_style] = (m.styles[post.ai_style] || 0) + 1;
    if (post.ai_model) m.models[post.ai_model] = (m.models[post.ai_model] || 0) + 1;
    m.likes.push(post.likes_count || 0);

    const postUrl = (post.media as { media_url: string }[])?.[0]?.media_url;
    if (!m.topPost || (post.likes_count || 0) > m.topPost.likes) {
      m.topPost = { url: postUrl || '', likes: post.likes_count || 0 };
    }
  });

  const allStyles = new Set<string>();
  const phases: StylePhase[] = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => {
      Object.keys(data.styles).forEach((s) => allStyles.add(s));
      const dominantStyle = Object.entries(data.styles).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mixed';
      const dominantModel = Object.entries(data.models).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
      const avgLikes = data.likes.length > 0 ? data.likes.reduce((a, b) => a + b, 0) / data.likes.length : 0;

      return {
        month,
        dominantStyle,
        dominantModel,
        postCount: data.likes.length,
        avgLikes: Math.round(avgLikes),
        topPostUrl: data.topPost?.url || null,
        styles: data.styles,
      };
    });

  // Calculate growth rate
  const firstPhaseAvg = phases[0]?.avgLikes || 0;
  const lastPhaseAvg = phases[phases.length - 1]?.avgLikes || 0;
  const growthRate = firstPhaseAvg > 0 ? Math.round(((lastPhaseAvg - firstPhaseAvg) / firstPhaseAvg) * 100) : 0;

  // Generate narrative
  const styleChanges = phases.filter((p, i) => i > 0 && p.dominantStyle !== phases[i - 1].dominantStyle).length;
  const currentFavorite = phases[phases.length - 1]?.dominantStyle || 'None';

  let styleJourney: string;
  if (styleChanges === 0) styleJourney = `You've been consistent with ${currentFavorite} — true dedication to your craft.`;
  else if (styleChanges <= 2) styleJourney = `You've evolved through ${styleChanges + 1} creative phases, settling on ${currentFavorite}.`;
  else styleJourney = `A true explorer! You've gone through ${styleChanges + 1} different style phases. Currently loving ${currentFavorite}.`;

  return {
    phases,
    totalStylesExplored: allStyles.size,
    currentFavorite,
    styleJourney,
    growthRate,
  };
}
